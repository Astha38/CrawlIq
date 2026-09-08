import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.crawl import CrawlCreate, CrawlResponse, CrawlResultsResponse

router = APIRouter(prefix="/crawls", tags=["crawls"])


@router.post("", response_model=CrawlResponse, status_code=status.HTTP_201_CREATED)
async def create_crawl(payload: CrawlCreate, db: AsyncSession = Depends(get_db)):
    """
    Kick off a new crawl for a site. Enqueues a Celery task and returns
    immediately with status=pending. Poll GET /crawls/{id} for progress.
    """
    # TODO: validate site exists & belongs to current user
    # TODO: create Crawl row, status=PENDING
    # TODO: enqueue Celery task (crawl_site.delay(crawl_id))
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{crawl_id}", response_model=CrawlResponse)
async def get_crawl(crawl_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Poll crawl status/progress."""
    # TODO: fetch Crawl by id, 404 if not found
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{crawl_id}/results", response_model=CrawlResultsResponse)
async def get_crawl_results(crawl_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Full results for a completed crawl: all pages with their extracted
    data + issues, plus the aggregate score. This is the primary endpoint
    the frontend dashboard and the AI recommendation layer will consume.
    """
    # TODO: fetch Crawl + Pages + Issues + Score, 404 if not found
    # TODO: 409 if crawl status != completed
    raise HTTPException(status_code=501, detail="Not implemented yet")
