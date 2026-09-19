from collections import defaultdict
from typing import Any
from app.models.enums import IssueSeverity


def analyze_page(page_data: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Evaluates a single crawled page's raw data and returns a list of SEO issues.
    """
    issues = []
    status_code = page_data.get("status_code", 200)

    # 1. HTTP Error Check
    if status_code and status_code >= 400:
        issues.append({
            "issue_type": "http_error",
            "severity": IssueSeverity.CRITICAL,
            "message": f"Page returned HTTP status code {status_code}.",
            "details": {"status_code": status_code}
        })
        return issues

    # 2. Title Checks
    title = page_data.get("title")
    title_len = page_data.get("title_length", len(title) if title else 0)

    if not title:
        issues.append({
            "issue_type": "missing_title",
            "severity": IssueSeverity.CRITICAL,
            "message": "Page is missing a <title> tag.",
            "details": {}
        })
    elif title_len < 30:
        issues.append({
            "issue_type": "title_too_short",
            "severity": IssueSeverity.WARNING,
            "message": f"Title tag is too short ({title_len} chars). Minimum recommended is 30 characters.",
            "details": {"title": title, "length": title_len}
        })
    elif title_len > 60:
        issues.append({
            "issue_type": "title_too_long",
            "severity": IssueSeverity.WARNING,
            "message": f"Title tag is too long ({title_len} chars). Maximum recommended is 60 characters.",
            "details": {"title": title, "length": title_len}
        })

    # 3. Meta Description Checks
    meta_desc = page_data.get("meta_description")
    meta_desc_len = page_data.get("meta_description_length", len(meta_desc) if meta_desc else 0)

    if not meta_desc:
        issues.append({
            "issue_type": "missing_meta_description",
            "severity": IssueSeverity.CRITICAL,
            "message": "Page is missing a meta description tag.",
            "details": {}
        })
    elif meta_desc_len < 120:
        issues.append({
            "issue_type": "meta_description_too_short",
            "severity": IssueSeverity.WARNING,
            "message": f"Meta description is too short ({meta_desc_len} chars). Minimum recommended is 120 characters.",
            "details": {"meta_description": meta_desc, "length": meta_desc_len}
        })
    elif meta_desc_len > 160:
        issues.append({
            "issue_type": "meta_description_too_long",
            "severity": IssueSeverity.WARNING,
            "message": f"Meta description is too long ({meta_desc_len} chars). Maximum recommended is 160 characters.",
            "details": {"meta_description": meta_desc, "length": meta_desc_len}
        })

    # 4. H1 Header Checks
    h1_count = page_data.get("h1_count", len(page_data.get("h1s", [])))
    h1s = page_data.get("h1s", [])

    if h1_count == 0:
        issues.append({
            "issue_type": "missing_h1",
            "severity": IssueSeverity.CRITICAL,
            "message": "Page is missing an <h1> header.",
            "details": {}
        })
    elif h1_count > 1:
        issues.append({
            "issue_type": "multiple_h1s",
            "severity": IssueSeverity.WARNING,
            "message": f"Page contains multiple <h1> headers ({h1_count} found). Pages should have exactly one <h1>.",
            "details": {"h1s": h1s}
        })

    # 5. Canonical Check
    canonical = page_data.get("canonical")
    if not canonical:
        issues.append({
            "issue_type": "missing_canonical",
            "severity": IssueSeverity.INFO,
            "message": "Page does not specify a canonical URL.",
            "details": {}
        })

    # 6. Robots Meta Tag Check
    robots_meta = page_data.get("robots_meta")
    if robots_meta and "noindex" in robots_meta.lower():
        issues.append({
            "issue_type": "robots_noindex",
            "severity": IssueSeverity.WARNING,
            "message": "Page specifies 'noindex' in meta robots tag.",
            "details": {"robots_meta": robots_meta}
        })

    # 7. Thin Content Check
    word_count = page_data.get("word_count", 0)
    if word_count < 200:
        issues.append({
            "issue_type": "thin_content",
            "severity": IssueSeverity.WARNING,
            "message": f"Page has thin content ({word_count} words). Minimum recommended is 200 words.",
            "details": {"word_count": word_count}
        })

    # 8. Missing Image Alt Attributes Check
    missing_alt_count = page_data.get("missing_alt_image_count", 0)
    if missing_alt_count > 0:
        issues.append({
            "issue_type": "missing_img_alt",
            "severity": IssueSeverity.WARNING,
            "message": f"Found {missing_alt_count} image(s) missing alt text.",
            "details": {"missing_alt_count": missing_alt_count}
        })

    return issues


def analyze_site(pages_data: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """
    Performs site-wide analysis across all crawled pages to detect cross-page issues:
      - Duplicate titles
      - Duplicate meta descriptions
      - Duplicate H1s
      - Broken internal links
      
    Returns a dictionary mapping page URL -> list of issues for that page.
    """
    page_issues_by_url = defaultdict(list)
    crawled_urls = {p.get("url") for p in pages_data if p.get("url")}
    status_by_url = {p.get("url"): p.get("status_code", 200) for p in pages_data if p.get("url")}

    # 1. Per-page checks first
    for page in pages_data:
        url = page.get("url")
        if url:
            page_issues_by_url[url].extend(analyze_page(page))

    # 2. Cross-page duplicates
    title_groups = defaultdict(list)
    meta_groups = defaultdict(list)
    h1_groups = defaultdict(list)

    for page in pages_data:
        url = page.get("url")
        if not url or page.get("status_code", 200) >= 400:
            continue

        title = page.get("title")
        if title:
            title_groups[title].append(url)

        meta = page.get("meta_description")
        if meta:
            meta_groups[meta].append(url)

        h1s = page.get("h1s", [])
        if h1s:
            h1_groups[h1s[0]].append(url)

    # Flag duplicate titles
    for title, urls in title_groups.items():
        if len(urls) > 1:
            for url in urls:
                page_issues_by_url[url].append({
                    "issue_type": "duplicate_title",
                    "severity": IssueSeverity.WARNING,
                    "message": f"Duplicate title tag shared across {len(urls)} pages.",
                    "details": {"title": title, "competing_urls": [u for u in urls if u != url]}
                })

    # Flag duplicate meta descriptions
    for meta, urls in meta_groups.items():
        if len(urls) > 1:
            for url in urls:
                page_issues_by_url[url].append({
                    "issue_type": "duplicate_meta_description",
                    "severity": IssueSeverity.WARNING,
                    "message": f"Duplicate meta description shared across {len(urls)} pages.",
                    "details": {"meta_description": meta, "competing_urls": [u for u in urls if u != url]}
                })

    # Flag duplicate H1s
    for h1, urls in h1_groups.items():
        if len(urls) > 1:
            for url in urls:
                page_issues_by_url[url].append({
                    "issue_type": "duplicate_h1",
                    "severity": IssueSeverity.WARNING,
                    "message": f"Duplicate H1 header '{h1}' shared across {len(urls)} pages.",
                    "details": {"h1": h1, "competing_urls": [u for u in urls if u != url]}
                })

    # 3. Broken internal links
    for page in pages_data:
        url = page.get("url")
        if not url:
            continue
        
        internal_links = page.get("internal_links", [])
        for link_target in internal_links:
            if link_target in status_by_url and status_by_url[link_target] >= 400:
                page_issues_by_url[url].append({
                    "issue_type": "broken_internal_link",
                    "severity": IssueSeverity.CRITICAL,
                    "message": f"Page contains a broken internal link to {link_target} (HTTP {status_by_url[link_target]}).",
                    "details": {"target_url": link_target, "status_code": status_by_url[link_target]}
                })

    return dict(page_issues_by_url)


def calculate_seo_score(all_issues: list[dict[str, Any]], page_count: int) -> dict[str, Any]:
    """
    Calculates an aggregate SEO score (0.0 - 100.0) based on total detected issues
    weighted by severity and normalized by the number of pages crawled.
    Handles page_count=0 and boundary values cleanly.
    """
    if page_count <= 0:
        return {
            "overall_score": 100.0,
            "breakdown": {
                "technical": 100.0,
                "content": 100.0,
                "meta": 100.0,
                "total_issues": 0,
                "critical_count": 0,
                "warning_count": 0,
                "info_count": 0
            }
        }

    critical_count = sum(1 for i in all_issues if i.get("severity") == IssueSeverity.CRITICAL)
    warning_count = sum(1 for i in all_issues if i.get("severity") == IssueSeverity.WARNING)
    info_count = sum(1 for i in all_issues if i.get("severity") == IssueSeverity.INFO)

    # Weighted penalty normalized by page_count
    critical_penalty = (critical_count / page_count) * 15.0
    warning_penalty = (warning_count / page_count) * 5.0
    info_penalty = (info_count / page_count) * 1.0

    total_penalty = critical_penalty + warning_penalty + info_penalty
    overall_score = round(max(0.0, min(100.0, 100.0 - total_penalty)), 1)

    meta_issues = [i for i in all_issues if "title" in i["issue_type"] or "meta" in i["issue_type"]]
    content_issues = [i for i in all_issues if "h1" in i["issue_type"] or "thin" in i["issue_type"] or "alt" in i["issue_type"]]
    tech_issues = [i for i in all_issues if i not in meta_issues and i not in content_issues]

    def calc_cat_score(cat_issues):
        p = sum(10.0 if i.get("severity") == IssueSeverity.CRITICAL else (4.0 if i.get("severity") == IssueSeverity.WARNING else 1.0) for i in cat_issues)
        return round(max(0.0, min(100.0, 100.0 - (p / page_count) * 10.0)), 1)

    return {
        "overall_score": overall_score,
        "breakdown": {
            "technical": calc_cat_score(tech_issues),
            "content": calc_cat_score(content_issues),
            "meta": calc_cat_score(meta_issues),
            "total_issues": len(all_issues),
            "critical_count": critical_count,
            "warning_count": warning_count,
            "info_count": info_count
        }
    }
