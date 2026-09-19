import pytest
from app.models.enums import IssueSeverity
from app.services.seo_analyzer import analyze_page, analyze_site, calculate_seo_score


def test_analyze_page_http_error():
    page_data = {"status_code": 404, "url": "https://example.com/broken"}
    issues = analyze_page(page_data)

    assert len(issues) == 1
    assert issues[0]["issue_type"] == "http_error"
    assert issues[0]["severity"] == IssueSeverity.CRITICAL


@pytest.mark.parametrize(
    "title,expected_type",
    [
        (None, "missing_title"),
        ("", "missing_title"),
        ("Short", "title_too_short"),  # len 5 < 30
        ("A" * 29, "title_too_short"),  # boundary: 29 < 30
        ("A" * 30, None),              # boundary: 30 OK
        ("A" * 60, None),              # boundary: 60 OK
        ("A" * 61, "title_too_long"),   # boundary: 61 > 60
    ],
)
def test_title_boundary_conditions(title, expected_type):
    page_data = {
        "status_code": 200,
        "title": title,
        "meta_description": "A" * 130,
        "h1s": ["Heading"],
        "h1_count": 1,
        "word_count": 250,
    }
    issues = analyze_page(page_data)
    types = [i["issue_type"] for i in issues]
    if expected_type:
        assert expected_type in types
    else:
        assert not any("title" in t for t in types)


@pytest.mark.parametrize(
    "meta_desc,expected_type",
    [
        (None, "missing_meta_description"),
        ("", "missing_meta_description"),
        ("Short", "meta_description_too_short"),
        ("B" * 119, "meta_description_too_short"),  # boundary 119 < 120
        ("B" * 120, None),                          # boundary 120 OK
        ("B" * 160, None),                          # boundary 160 OK
        ("B" * 161, "meta_description_too_long"),   # boundary 161 > 160
    ],
)
def test_meta_description_boundary_conditions(meta_desc, expected_type):
    page_data = {
        "status_code": 200,
        "title": "A" * 40,
        "meta_description": meta_desc,
        "h1s": ["Heading"],
        "h1_count": 1,
        "word_count": 250,
    }
    issues = analyze_page(page_data)
    types = [i["issue_type"] for i in issues]
    if expected_type:
        assert expected_type in types
    else:
        assert not any("meta_description" in t for t in types)


@pytest.mark.parametrize(
    "word_count,expected_thin",
    [
        (0, True),
        (199, True),   # boundary: < 200
        (200, False),  # boundary: 200 OK
        (500, False),
    ],
)
def test_word_count_boundary_conditions(word_count, expected_thin):
    page_data = {
        "status_code": 200,
        "title": "A" * 40,
        "meta_description": "B" * 130,
        "h1s": ["Heading"],
        "h1_count": 1,
        "word_count": word_count,
    }
    issues = analyze_page(page_data)
    types = [i["issue_type"] for i in issues]
    assert ("thin_content" in types) == expected_thin


def test_analyze_site_duplicates_and_broken_links():
    pages = [
        {
            "url": "https://example.com/p1",
            "status_code": 200,
            "title": "Shared Title",
            "meta_description": "Shared Meta Description Here That Meets Length",
            "h1s": ["Shared H1 Header"],
            "internal_links": ["https://example.com/broken_p"],
            "word_count": 300,
        },
        {
            "url": "https://example.com/p2",
            "status_code": 200,
            "title": "Shared Title",
            "meta_description": "Shared Meta Description Here That Meets Length",
            "h1s": ["Shared H1 Header"],
            "internal_links": [],
            "word_count": 300,
        },
        {
            "url": "https://example.com/broken_p",
            "status_code": 404,
            "title": "404 Not Found",
            "word_count": 10,
        },
    ]

    site_issues = analyze_site(pages)

    p1_types = [i["issue_type"] for i in site_issues["https://example.com/p1"]]
    p2_types = [i["issue_type"] for i in site_issues["https://example.com/p2"]]

    assert "duplicate_title" in p1_types
    assert "duplicate_meta_description" in p1_types
    assert "duplicate_h1" in p1_types
    assert "broken_internal_link" in p1_types

    assert "duplicate_title" in p2_types


def test_scoring_edge_cases():
    # Zero pages
    res_zero = calculate_seo_score([], page_count=0)
    assert res_zero["overall_score"] == 100.0

    # Large penalty clamping to 0
    severe_issues = [{"issue_type": "http_error", "severity": IssueSeverity.CRITICAL}] * 20
    res_severe = calculate_seo_score(severe_issues, page_count=1)
    assert res_severe["overall_score"] == 0.0
