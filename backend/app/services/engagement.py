"""Engagement service — the single place that records activity and pushes
notifications.

Design: these helpers only ``db.add(...)`` rows to the caller's session and
return them; the calling route owns the transaction and commits. This keeps
event recording atomic with the action that triggered it (e.g. a quiz and its
"quiz generated" notification commit together, or not at all).
"""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models.engagement import ActivityLog, Notification


def log_activity(
    db: Session,
    user_id: uuid.UUID,
    *,
    action: str,
    summary: str,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
    meta: dict[str, Any] | None = None,
) -> ActivityLog:
    """Append an entry to the user's activity stream."""
    row = ActivityLog(
        user_id=user_id,
        action=action,
        summary=summary,
        entity_type=entity_type,
        entity_id=entity_id,
        meta=meta or {},
    )
    db.add(row)
    return row


def push_notification(
    db: Session,
    user_id: uuid.UUID,
    *,
    type: str,
    category: str,
    title: str,
    body: str | None = None,
    link: str | None = None,
    meta: dict[str, Any] | None = None,
) -> Notification:
    """Create a notification for the notification center."""
    row = Notification(
        user_id=user_id,
        type=type,
        category=category,
        title=title,
        body=body,
        link=link,
        meta=meta or {},
    )
    db.add(row)
    return row


def record_event(
    db: Session,
    user_id: uuid.UUID,
    *,
    action: str,
    category: str,
    title: str,
    summary: str,
    body: str | None = None,
    link: str | None = None,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
    meta: dict[str, Any] | None = None,
) -> tuple[ActivityLog, Notification]:
    """Convenience for the common case: a single user action that should both
    appear in the activity feed *and* raise a notification.

    ``action`` doubles as the notification ``type`` so the two stay in sync.
    """
    activity = log_activity(
        db,
        user_id,
        action=action,
        summary=summary,
        entity_type=entity_type,
        entity_id=entity_id,
        meta=meta,
    )
    notification = push_notification(
        db,
        user_id,
        type=action,
        category=category,
        title=title,
        body=body,
        link=link,
        meta=meta,
    )
    return activity, notification


# ---------- read side (notification center + activity feed) ----------
def list_notifications(
    db: Session,
    user_id: uuid.UUID,
    *,
    category: str | None = None,
    unread_only: bool = False,
    limit: int = 50,
) -> list[Notification]:
    stmt = select(Notification).where(Notification.user_id == user_id)
    if category and category != "all":
        stmt = stmt.where(Notification.category == category)
    if unread_only:
        stmt = stmt.where(Notification.read.is_(False))
    stmt = stmt.order_by(Notification.created_at.desc()).limit(limit)
    return list(db.scalars(stmt).all())


def unread_count(db: Session, user_id: uuid.UUID) -> int:
    return int(
        db.scalar(
            select(func.count())
            .select_from(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.read.is_(False),
            )
        )
        or 0
    )


def mark_read(db: Session, user_id: uuid.UUID, notif_id: uuid.UUID) -> bool:
    notif = db.get(Notification, notif_id)
    if not notif or notif.user_id != user_id:
        return False
    notif.read = True
    db.commit()
    return True


def mark_all_read(db: Session, user_id: uuid.UUID) -> int:
    result = db.execute(
        update(Notification)
        .where(
            Notification.user_id == user_id,
            Notification.read.is_(False),
        )
        .values(read=True)
    )
    db.commit()
    return result.rowcount or 0


def recent_activity(
    db: Session, user_id: uuid.UUID, *, limit: int = 20
) -> list[ActivityLog]:
    stmt = (
        select(ActivityLog)
        .where(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())
