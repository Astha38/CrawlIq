import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum, func, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import IssueSeverity


class Issue(Base):
    """
    A single detected SEO problem on a page (e.g. missing meta description,
    broken link, missing alt text). `details` is JSONB for issue-specific context
    that varies by issue_type, so we don't need a new column per rule.
    """

    __tablename__ = "issues"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    page_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("pages.id", ondelete="CASCADE"))

    issue_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    severity: Mapped[IssueSeverity] = mapped_column(SAEnum(IssueSeverity, name="issue_severity"), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    details: Mapped[dict] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    page: Mapped["Page"] = relationship(back_populates="issues")
