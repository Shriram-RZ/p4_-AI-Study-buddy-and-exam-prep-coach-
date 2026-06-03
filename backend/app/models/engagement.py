"""Engagement models — notifications & activity logging.

These power the notification center, the dashboard activity feed, and
downstream analytics. Kept in a dedicated module (feature-based) so the
notification/activity backbone is easy to reason about and extend.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Boolean, Text, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.session import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class Notification(Base):
    """A user-facing notification surfaced in the notification center."""

    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=_uuid
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    # Fine-grained event, e.g. "quiz_completed", "streak_increased".
    type: Mapped[str] = mapped_column(String(48))
    # Coarse bucket used by the panel's filter, e.g. "quiz", "planner".
    category: Mapped[str] = mapped_column(String(24), default="system")
    title: Mapped[str] = mapped_column(String(180))
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Optional deep link into the app (e.g. "/dashboard/quizzes").
    link: Mapped[str | None] = mapped_column(String(255), nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    meta: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("idx_notifications_user_read", "user_id", "read", "created_at"),
    )


class ActivityLog(Base):
    """An append-only record of a meaningful user action.

    Feeds the dashboard "Recent Activity" stream and analytics. Many actions
    also spawn a Notification, but activity is the durable source of truth.
    """

    __tablename__ = "activity_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=_uuid
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    # e.g. "quiz_completed", "flashcards_reviewed", "notes_summarized".
    action: Mapped[str] = mapped_column(String(48))
    # The thing acted on, e.g. ("quiz", <quiz_id>).
    entity_type: Mapped[str | None] = mapped_column(String(40), nullable=True)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    summary: Mapped[str] = mapped_column(String(255))
    meta: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user = relationship("User", back_populates="activities")

    __table_args__ = (
        Index("idx_activity_user_created", "user_id", "created_at"),
    )
