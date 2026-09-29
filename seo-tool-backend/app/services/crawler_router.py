import json
import os
import tempfile
from typing import Any
from urllib.parse import urlparse

from app.services.crawl_runner import run_spider_process
from app.services.playwright_crawler import crawl_page_playwright_sync


def is_spa_shell(page_data: dict[str, Any]) -> bool:
    """
    Determines whether a crawled page appears to be an un-rendered SPA shell:
      - HTTP status is 200
      - Low word count (< 20) or missing title & meta description despite HTML response
    """
    status_code = page_data.get("status_code", 200)
    if status_code != 200:
        return False

    word_count = page_data.get("word_count", 0)
    has_title = bool(page_data.get("title"))
    has_meta = bool(page_data.get("meta_description"))

    # If thin content (< 20 words) or missing both title and meta, fallback to Playwright
    if word_count < 20 or (not has_title and not has_meta):
        return True

    return False


def run_hybrid_crawl(
    start_url: str,
    max_pages: int = 100,
    output_filepath: str | None = None,
) -> list[dict[str, Any]]:
    """
    Executes a hybrid crawl:
      1. Runs Scrapy spider for fast static page collection.
      2. Detects SPA shells / thin JS pages.
      3. Uses Playwright fallback engine to re-render SPA pages and capture full JS DOM.
      4. Returns combined pages dataset tagged with crawler_used ("scrapy" or "playwright").
    """
    domain = urlparse(start_url).netloc.split(":")[0].lower()

    # Create temporary file for Scrapy output
    temp_file = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
    temp_scrapy_path = temp_file.name
    temp_file.close()

    pages: list[dict[str, Any]] = []

    try:
        run_spider_process(start_url=start_url, max_pages=max_pages, output_filepath=temp_scrapy_path)

        if os.path.exists(temp_scrapy_path) and os.path.getsize(temp_scrapy_path) > 0:
            with open(temp_scrapy_path, "r", encoding="utf-8") as f:
                pages = json.load(f)

    except Exception:
        # If Scrapy fails completely (e.g. strict JS redirect), attempt initial Playwright fallback
        try:
            pw_page = crawl_page_playwright_sync(start_url, target_domain=domain)
            pages = [pw_page]
        except Exception:
            pages = []
    finally:
        if os.path.exists(temp_scrapy_path):
            try:
                os.remove(temp_scrapy_path)
            except Exception:
                pass

    # Tag initial Scrapy pages
    for p in pages:
        p["crawler_used"] = "scrapy"

    # Evaluate each page for Playwright JS fallback
    final_pages: list[dict[str, Any]] = []
    for p in pages:
        if is_spa_shell(p):
            try:
                pw_data = crawl_page_playwright_sync(p["url"], target_domain=domain)
                # Use Playwright data if it successfully captured content
                if pw_data.get("word_count", 0) > p.get("word_count", 0) or pw_data.get("title"):
                    final_pages.append(pw_data)
                else:
                    final_pages.append(p)
            except Exception:
                final_pages.append(p)
        else:
            final_pages.append(p)

    if output_filepath:
        os.makedirs(os.path.dirname(os.path.abspath(output_filepath)), exist_ok=True)
        with open(output_filepath, "w", encoding="utf-8") as f:
            json.dump(final_pages, f, ensure_ascii=False, indent=2)

    return final_pages
