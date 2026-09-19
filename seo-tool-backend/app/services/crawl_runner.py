import argparse
import json
import os
import sys
import tempfile
import scrapy
from scrapy.crawler import CrawlerProcess
from app.services.seo_spider import SEOSpider


class JSONCollectorPipeline:
    collected_items = []

    def process_item(self, item, spider):
        JSONCollectorPipeline.collected_items.append(dict(item))
        return item


def run_spider_process(start_url: str, max_pages: int, output_filepath: str):
    """Executes the Scrapy spider and writes JSON output to output_filepath."""
    JSONCollectorPipeline.collected_items = []

    process = CrawlerProcess(settings={
        "LOG_LEVEL": "ERROR",
        "CLOSESPIDER_PAGECOUNT": max_pages,
        "ITEM_PIPELINES": {f"{__name__}.JSONCollectorPipeline": 1},
        "USER_AGENT": "SEO-Analysis-Bot/1.0 (+https://crawliq.com)",
        "ROBOTSTXT_OBEY": False,
        "CONCURRENT_REQUESTS": 8,
        "DOWNLOAD_DELAY": 0.1,
    })

    process.crawl(SEOSpider, start_url=start_url, max_pages=max_pages)
    process.start()

    os.makedirs(os.path.dirname(os.path.abspath(output_filepath)), exist_ok=True)
    with open(output_filepath, "w", encoding="utf-8") as f:
        json.dump(JSONCollectorPipeline.collected_items, f, ensure_ascii=False, indent=2)

    print(f"Crawl completed. Exported {len(JSONCollectorPipeline.collected_items)} pages to {output_filepath}")


def main():
    parser = argparse.ArgumentParser(description="Isolated Scrapy runner for SEO crawls")
    parser.add_argument("--url", required=True, help="Target start URL")
    parser.add_argument("--max-pages", type=int, default=100, help="Max pages to crawl")
    parser.add_argument("--output", help="Output JSON file path (optional, defaults to a temp file)")
    args = parser.parse_args()

    output_path = args.output
    if not output_path:
        temp_file = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
        output_path = temp_file.name
        temp_file.close()

    try:
        run_spider_process(start_url=args.url, max_pages=args.max_pages, output_filepath=output_path)
    except Exception as e:
        sys.stderr.write(f"Crawl process failed with error: {str(e)}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
