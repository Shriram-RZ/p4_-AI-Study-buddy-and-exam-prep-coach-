import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Integer, ForeignKey, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=_uuid
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(120))
    education_level: Mapped[str | None] = mapped_column(String(80), nullable=True)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    productivity_score: Mapped[int] = mapped_column(Integer, default=70)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    plans = relationship(
        "StudyPlan", back_populates="user", cascade="all, delete-orphan"
    )
    notes = relationship(
        "UploadedNote", back_populates="user", cascade="all, delete-orphan"
    )
    quizzes = relationship(
        "Quiz", back_populates="user", cascade="all, delete-orphan"
    )
    flashcards = relationship(
        "Flashcard", back_populates="user", cascade="all, delete-orphan"
    )
    chats = relationship(
        "ChatHistory", back_populates="user", cascade="all, delete-orphan"
    )
    weak_areas = relationship(
        "WeakArea", back_populates="user", cascade="all, delete-orphan"
    )


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=_uuid
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
