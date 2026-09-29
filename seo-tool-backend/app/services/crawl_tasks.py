import json
import os
import tempfile
import uuid
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.celery_app import celery_app
from app.core.config import settings
from app.models import Crawl, Site, Page, Issue, Score, CrawlStatus, CrawlerType
from app.services.crawler_router import run_hybrid_crawl
from app.services.pagespeed_service import fetch_pagespeed_metrics_sync
from app.services.seo_analyzer import analyze_site, calculate_seo_score


def get_sync_db_session():
    engine_sync = create_engine(settings.database_url_sync, pool_pre_ping=True)
    return sessionmaker(bind=engine_sync)()


@celery_app.task(name="crawl_site")
def crawl_site(crawl_id: str):
    """
    Background task that runs a full crawl for a given crawl_id:
      1. Load Crawl + Site from DB, mark status=running
      2. Run hybrid Scrapy + Playwright fallback crawler to collect pages
      3. Extract SEO signals, store as Page rows (raw_data JSONB, crawler_used, performance_data)
      4. Run PageSpeed Insights for main start page
      5. Run scoring & issue analysis logic -> create Issue & Score rows
      6. Mark crawl status=completed (or failed, with error_message)
    """
    crawl_uuid = uuid.UUID(crawl_id)
    db = get_sync_db_session()

    try:
        crawl = db.query(Crawl).filter(Crawl.id == crawl_uuid).first()
        if not crawl:
            return

        site = db.query(Site).filter(Site.id == crawl.site_id).first()
        if not site:
            crawl.status = CrawlStatus.FAILED
            crawl.error_message = "Associated site not found"
            crawl.completed_at = datetime.now(timezone.utc)
            db.commit()
            return

        crawl.status = CrawlStatus.RUNNING
        crawl.started_at = datetime.now(timezone.utc)
        db.commit()

        start_url = site.domain
        if not (start_url.startswith("http://") or start_url.startswith("https://")):
            start_url = f"https://{start_url}"

        temp_file = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
        output_filepath = temp_file.name
        temp_file.close()

        try:
            pages_data = run_hybrid_crawl(
                start_url=start_url,
                max_pages=crawl.max_pages,
                output_filepath=output_filepath,
            )

            # Analyze site for issues (per-page & site-wide)
            page_issues_by_url = analyze_site(pages_data)
            all_issues_flat = []

            # Fetch PageSpeed performance metrics for start URL
            pagespeed_result = None
            try:
                pagespeed_result = fetch_pagespeed_metrics_sync(start_url)
            except Exception:
                pagespeed_result = None

            for page_dict in pages_data:
                page_url = page_dict.get("url", "")
                status_code = page_dict.get("status_code", 200)

                crawler_str = page_dict.get("crawler_used", "scrapy").lower()
                crawler_enum = (
                    CrawlerType.PLAYWRIGHT if crawler_str == "playwright" else CrawlerType.SCRAPY
                )

                # Attach PageSpeed data to the main landing page if URLs match or start_url
                perf_data = None
                if pagespeed_result and (page_url == start_url or page_url.rstrip("/") == start_url.rstrip("/")):
                    perf_data = pagespeed_result

                page_obj = Page(
                    id=uuid.uuid4(),
                    crawl_id=crawl.id,
                    url=page_url,
                    status_code=status_code,
                    crawler_used=crawler_enum,
                    raw_data=page_dict,
                    performance_data=perf_data,
                )
                db.add(page_obj)

                issues = page_issues_by_url.get(page_url, [])
                for issue_dict in issues:
                    all_issues_flat.append(issue_dict)
                    issue_obj = Issue(
                        id=uuid.uuid4(),
                        page_id=page_obj.id,
                        issue_type=issue_dict["issue_type"],
                        severity=issue_dict["severity"],
                        message=issue_dict["message"],
                        details=issue_dict.get("details"),
                    )
                    db.add(issue_obj)

            # Calculate and store aggregate SEO score
            score_data = calculate_seo_score(all_issues_flat, len(pages_data))
            score_obj = Score(
                id=uuid.uuid4(),
                crawl_id=crawl.id,
                overall_score=score_data["overall_score"],
                breakdown=score_data["breakdown"],
            )
            db.add(score_obj)

            crawl.pages_crawled = len(pages_data)
            crawl.status = CrawlStatus.COMPLETED
            crawl.completed_at = datetime.now(timezone.utc)
            db.commit()

        except Exception as e:
            db.rollback()
            crawl.status = CrawlStatus.FAILED
            crawl.error_message = str(e)
            crawl.completed_at = datetime.now(timezone.utc)
            db.commit()
            raise
        finally:
            if os.path.exists(output_filepath):
                try:
                    os.remove(output_filepath)
                except Exception:
                    pass
    finally:
        db.close()
