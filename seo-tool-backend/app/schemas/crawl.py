import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.enums import CrawlStatus


class CrawlCreate(BaseModel):
    site_id: uuid.UUID
    max_pages: int = 100


class CrawlResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    site_id: uuid.UUID
    status: CrawlStatus
    pages_crawled: int
    max_pages: int
    started_at: datetime | None
    completed_at: datetime | None
    error_message: str | None
    created_at: datetime


class IssueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    issue_type: str
    severity: str
    message: str
    details: dict | None


class PageResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    url: str
    status_code: int | None
    raw_data: dict
    performance_data: dict | None
    issues: list[IssueResponse] = []


class ScoreBreakdown(BaseModel):
    technical: float
    content: float
    performance: float
    # extend as scoring categories evolve; kept loose via `breakdown` JSONB
    # on the model, this is just the typed contract for the API response


class ScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    crawl_id: uuid.UUID
    overall_score: float
    breakdown: dict
    calculated_at: datetime


class CrawlResultsResponse(BaseModel):
    """Full results for a completed crawl: pages + score."""
    crawl: CrawlResponse
    score: ScoreResponse | None
    pages: list[PageResultResponse]
