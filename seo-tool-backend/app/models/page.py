import uuid
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum as SAEnum, func, JSON, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import CrawlerType


class Page(Base):
    """
    A single crawled page. `raw_data` holds semi-structured extracted content
    (meta tags, headers, links, images, etc.) as JSONB so the schema can evolve
    without new migrations for every new SEO signal we start capturing.
    """

    __tablename__ = "pages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    crawl_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("crawls.id", ondelete="CASCADE"))

    url: Mapped[str] = mapped_column(String(2048), nullable=False, index=True)
    status_code: Mapped[int] = mapped_column(Integer, nullable=True)
    crawler_used: Mapped[CrawlerType] = mapped_column(SAEnum(CrawlerType, name="crawler_type"), nullable=True)

    # Semi-structured SEO extraction: title, meta_description, h1s, word_count,
    # internal_links, external_links, images (with alt text flags), canonical, etc.
    raw_data: Mapped[dict] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=dict)

    # PageSpeed / Lighthouse results, also semi-structured
    performance_data: Mapped[dict] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)

    crawled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    crawl: Mapped["Crawl"] = relationship(back_populates="pages")
    issues: Mapped[list["Issue"]] = relationship(back_populates="page", cascade="all, delete-orphan")
