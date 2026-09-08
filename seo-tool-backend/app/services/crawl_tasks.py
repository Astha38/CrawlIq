from app.core.celery_app import celery_app


@celery_app.task(name="crawl_site")
def crawl_site(crawl_id: str):
    """
    Background task that runs a full crawl for a given crawl_id:
      1. Load Crawl + Site from DB, mark status=running
      2. For each URL to crawl: route to Scrapy or Playwright
      3. Extract SEO signals, store as Page rows (raw_data JSONB)
      4. Run scoring logic -> create Score row
      5. Mark crawl status=completed (or failed, with error_message)
    """
    # TODO: implement in Week 2-3
    raise NotImplementedError
