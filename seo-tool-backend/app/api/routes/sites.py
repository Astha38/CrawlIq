import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.site import SiteCreate, SiteResponse
from app.schemas.crawl import ScoreResponse

router = APIRouter(prefix="/sites", tags=["sites"])


@router.post("", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(payload: SiteCreate, db: AsyncSession = Depends(get_db)):
    """Register a new site for the current user to analyze."""
    # TODO: create Site row scoped to current authenticated user
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("", response_model=list[SiteResponse])
async def list_sites(db: AsyncSession = Depends(get_db)):
    """List all sites belonging to the current user."""
    # TODO: query sites for current user
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(site_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get a single site."""
    # TODO: fetch site, 404 if not found or not owned by current user
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{site_id}/score", response_model=ScoreResponse)
async def get_latest_score(site_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Latest score for a site (from its most recent completed crawl).
    Convenience endpoint so the dashboard doesn't need to look up the
    latest crawl id first.
    """
    # TODO: find most recent completed crawl for site, return its score
    raise HTTPException(status_code=501, detail="Not implemented yet")
