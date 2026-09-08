# Import all models here so Alembic's autogenerate can discover them
# via Base.metadata, and so `from app.models import Site, Crawl, ...` works.
from app.models.site import Site
from app.models.crawl import Crawl
from app.models.page import Page
from app.models.issue import Issue
from app.models.score import Score
from app.models.enums import CrawlStatus, CrawlerType, IssueSeverity

__all__ = [
    "Site",
    "Crawl",
    "Page",
    "Issue",
    "Score",
    "CrawlStatus",
    "CrawlerType",
    "IssueSeverity",
]
