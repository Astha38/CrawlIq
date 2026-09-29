import json
import tempfile
import uuid
from unittest.mock import MagicMock, patch

from app.models import Crawl, Site, CrawlStatus
from app.services.crawl_tasks import crawl_site


def test_crawl_site_task_missing_crawl():
    mock_db = MagicMock()
    mock_db.query().filter().first.return_value = None

    with patch("app.services.crawl_tasks.get_sync_db_session", return_value=mock_db):
        crawl_site(str(uuid.uuid4()))
        mock_db.commit.assert_not_called()


def test_crawl_site_task_missing_site():
    crawl_id = uuid.uuid4()
    mock_crawl = Crawl(id=crawl_id, site_id=uuid.uuid4(), status=CrawlStatus.PENDING)

    mock_db = MagicMock()
    # First call returns crawl, second call for site returns None
    mock_db.query().filter().first.side_effect = [mock_crawl, None]

    with patch("app.services.crawl_tasks.get_sync_db_session", return_value=mock_db):
        crawl_site(str(crawl_id))
        assert mock_crawl.status == CrawlStatus.FAILED
        assert mock_crawl.error_message == "Associated site not found"
        mock_db.commit.assert_called()


def test_crawl_site_task_success():
    crawl_id = uuid.uuid4()
    site_id = uuid.uuid4()
    mock_crawl = Crawl(id=crawl_id, site_id=site_id, max_pages=10, status=CrawlStatus.PENDING)
    mock_site = Site(id=site_id, domain="https://example.com")

    mock_db = MagicMock()
    mock_db.query().filter().first.side_effect = [mock_crawl, mock_site]

    sample_scraped_data = [
        {
            "url": "https://example.com",
            "status_code": 200,
            "title": "Example Domain",
            "title_length": 14,
            "meta_description": "Example description for testing crawl task.",
            "meta_description_length": 42,
            "h1s": ["Example Heading"],
            "internal_links": [],
            "external_links": [],
            "images": [{"src": "logo.png", "alt": "Logo"}],
        }
    ]

    def dummy_run_hybrid_crawl(start_url, max_pages, output_filepath):
        with open(output_filepath, "w", encoding="utf-8") as f:
            json.dump(sample_scraped_data, f)
        return sample_scraped_data

    with patch("app.services.crawl_tasks.get_sync_db_session", return_value=mock_db), \
         patch("app.services.crawl_tasks.run_hybrid_crawl", side_effect=dummy_run_hybrid_crawl):
        
        crawl_site(str(crawl_id))
        
        assert mock_crawl.status == CrawlStatus.COMPLETED
        assert mock_crawl.pages_crawled == 1
        assert mock_db.add.call_count >= 3  # Page, Issue, Score
        mock_db.commit.assert_called()
