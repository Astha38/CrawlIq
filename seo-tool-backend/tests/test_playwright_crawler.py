import pytest
from unittest.mock import patch

from app.services.crawler_router import is_spa_shell, run_hybrid_crawl


def test_is_spa_shell_detection():
    # Regular page with title, meta description, and 100 words -> NOT SPA shell
    regular_page = {
        "status_code": 200,
        "title": "Normal Page Title",
        "meta_description": "Normal meta description text for testing.",
        "word_count": 120,
    }
    assert is_spa_shell(regular_page) is False

    # Page with 404 status code -> NOT SPA shell
    error_page = {
        "status_code": 404,
        "word_count": 5,
    }
    assert is_spa_shell(error_page) is False

    # Page with < 20 words (e.g. React root container) -> SPA shell
    spa_page = {
        "status_code": 200,
        "title": None,
        "meta_description": None,
        "word_count": 4,
    }
    assert is_spa_shell(spa_page) is True


def test_run_hybrid_crawl_scrapy_only():
    sample_scrapy_output = [
        {
            "url": "https://example.com",
            "status_code": 200,
            "title": "Static Page",
            "meta_description": "Static page description with plenty of content.",
            "word_count": 150,
        }
    ]

    with patch("app.services.crawler_router.run_spider_process") as mock_spider, \
         patch("app.services.crawler_router.is_spa_shell", return_value=False):
        
        # Simulate Scrapy runner writing JSON file
        def fake_spider_run(start_url, max_pages, output_filepath):
            import json
            with open(output_filepath, "w", encoding="utf-8") as f:
                json.dump(sample_scrapy_output, f)

        mock_spider.side_effect = fake_spider_run

        results = run_hybrid_crawl("https://example.com", max_pages=10)
        assert len(results) == 1
        assert results[0]["crawler_used"] == "scrapy"
        assert results[0]["title"] == "Static Page"


def test_run_hybrid_crawl_playwright_fallback():
    thin_scrapy_output = [
        {
            "url": "https://spa-example.com",
            "status_code": 200,
            "title": None,
            "meta_description": None,
            "word_count": 2,
        }
    ]

    enriched_pw_output = {
        "url": "https://spa-example.com",
        "original_url": "https://spa-example.com",
        "was_redirected": False,
        "status_code": 200,
        "title": "Rendered SPA App",
        "title_length": 16,
        "meta_description": "Rendered meta description from client side JS.",
        "meta_description_length": 45,
        "h1s": ["Welcome to SPA"],
        "h1_count": 1,
        "canonical": None,
        "robots_meta": None,
        "word_count": 250,
        "internal_links": [],
        "external_links": [],
        "images": [],
        "missing_alt_image_count": 0,
        "crawler_used": "playwright",
    }

    with patch("app.services.crawler_router.run_spider_process") as mock_spider, \
         patch("app.services.crawler_router.crawl_page_playwright_sync", return_value=enriched_pw_output) as mock_pw:
        
        def fake_spider_run(start_url, max_pages, output_filepath):
            import json
            with open(output_filepath, "w", encoding="utf-8") as f:
                json.dump(thin_scrapy_output, f)

        mock_spider.side_effect = fake_spider_run

        results = run_hybrid_crawl("https://spa-example.com", max_pages=10)
        assert len(results) == 1
        assert results[0]["crawler_used"] == "playwright"
        assert results[0]["title"] == "Rendered SPA App"
        assert results[0]["word_count"] == 250
        mock_pw.assert_called_once_with("https://spa-example.com", target_domain="spa-example.com")
