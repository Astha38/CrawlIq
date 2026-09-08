import uuid
from datetime import datetime

from sqlalchemy import Float, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Score(Base):
    """
    Aggregate SEO score for a crawl. `breakdown` holds the per-category
    scores (technical, content, performance, etc.) as JSONB so scoring
    weights/categories can change without a migration.
    """

    __tablename__ = "scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crawl_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("crawls.id", ondelete="CASCADE"), unique=True
    )

    overall_score: Mapped[float] = mapped_column(Float, nullable=False)
    breakdown: Mapped[dict] = mapped_column(JSONB, default=dict)

    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    crawl: Mapped["Crawl"] = relationship(back_populates="score")
