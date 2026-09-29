from datetime import datetime, timezone
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Crawl, Site, Page, CrawlStatus
from app.schemas.crawl import CrawlCreate, CrawlResponse, CrawlResultsResponse
from app.services.crawl_tasks import crawl_site

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/crawls", tags=["crawls"])


@router.post("", response_model=CrawlResponse, status_code=status.HTTP_201_CREATED)
async def create_crawl(payload: CrawlCreate, db: AsyncSession = Depends(get_db)):
    """
    Kick off a new crawl for a site. Enqueues a Celery task and returns
    immediately with status=pending. Poll GET /crawls/{id} for progress.
    """
    site = await db.get(Site, payload.site_id)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    now = datetime.now(timezone.utc)
    crawl = Crawl(
        id=uuid.uuid4(),
        site_id=payload.site_id,
        pages_crawled=0,
        max_pages=payload.max_pages,
        status=CrawlStatus.PENDING,
        created_at=now,
    )
    db.add(crawl)
    await db.commit()
    await db.refresh(crawl)

    # Enqueue background Celery task
    try:
        crawl_site.delay(str(crawl.id))
    except Exception as exc:
        logger.warning(f"Could not enqueue Celery task for crawl {crawl.id}: {exc}")

    return crawl


@router.get("/{crawl_id}", response_model=CrawlResponse)
async def get_crawl(crawl_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Poll crawl status/progress."""
    crawl = await db.get(Crawl, crawl_id)
    if not crawl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crawl not found")
    return crawl


@router.get("/{crawl_id}/results", response_model=CrawlResultsResponse)
async def get_crawl_results(crawl_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Full results for a completed crawl: all pages with their extracted
    data + issues, plus the aggregate score. Primary endpoint for frontend dashboard & AI recommendations.
    """
    stmt = (
        select(Crawl)
        .options(
            selectinload(Crawl.pages).selectinload(Page.issues),
            selectinload(Crawl.score),
        )
        .where(Crawl.id == crawl_id)
    )
    result = await db.execute(stmt)
    crawl = result.scalar_one_or_none()

    if not crawl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crawl not found")

    if crawl.status != CrawlStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Crawl is not completed yet (current status: {crawl.status.value})",
        )

    return CrawlResultsResponse(
        crawl=crawl,
        score=crawl.score,
        pages=crawl.pages,
    )
