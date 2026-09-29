import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Enum as SAEnum, func, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import CrawlStatus


class Crawl(Base):
    """A single crawl run against a site. One site can have many crawls over time."""

    __tablename__ = "crawls"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sites.id", ondelete="CASCADE"))

    status: Mapped[CrawlStatus] = mapped_column(
        SAEnum(CrawlStatus, name="crawl_status"), default=CrawlStatus.PENDING, nullable=False
    )
    pages_crawled: Mapped[int] = mapped_column(Integer, default=0)
    max_pages: Mapped[int] = mapped_column(Integer, default=100)

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), default=lambda: datetime.now(timezone.utc))

    site: Mapped["Site"] = relationship(back_populates="crawls")
    pages: Mapped[list["Page"]] = relationship(back_populates="crawl", cascade="all, delete-orphan")
    score: Mapped["Score"] = relationship(back_populates="crawl", uselist=False, cascade="all, delete-orphan")
