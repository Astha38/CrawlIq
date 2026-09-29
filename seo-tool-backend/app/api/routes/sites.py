from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Site, Crawl, Score, CrawlStatus
from app.schemas.site import SiteCreate, SiteResponse
from app.schemas.crawl import ScoreResponse

router = APIRouter(prefix="/sites", tags=["sites"])

MOCK_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000000")


@router.post("", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(payload: SiteCreate, db: AsyncSession = Depends(get_db)):
    """Register a new site for the current user to analyze."""
    now = datetime.now(timezone.utc)
    site = Site(
        id=uuid.uuid4(),
        user_id=MOCK_USER_ID,
        domain=payload.domain,
        display_name=payload.display_name or payload.domain,
        created_at=now,
        updated_at=now,
    )
    db.add(site)
    await db.commit()
    await db.refresh(site)
    return site


@router.get("", response_model=list[SiteResponse])
async def list_sites(db: AsyncSession = Depends(get_db)):
    """List all sites belonging to the current user."""
    stmt = select(Site).order_by(Site.created_at.desc())
    result = await db.execute(stmt)
    sites = result.scalars().all()
    return sites


@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(site_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get a single site."""
    site = await db.get(Site, site_id)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return site


@router.get("/{site_id}/score", response_model=ScoreResponse)
async def get_latest_score(site_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Latest score for a site (from its most recent completed crawl).
    Convenience endpoint for dashboard view.
    """
    site = await db.get(Site, site_id)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    stmt = (
        select(Score)
        .join(Crawl, Score.crawl_id == Crawl.id)
        .where(Crawl.site_id == site_id, Crawl.status == CrawlStatus.COMPLETED)
        .order_by(Crawl.completed_at.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    score = result.scalar_one_or_none()

    if not score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No completed crawl score found for this site",
        )

    return score
