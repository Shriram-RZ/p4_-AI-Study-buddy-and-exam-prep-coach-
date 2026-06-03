import uuid

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import CurrentUser, DbDep
from app.api.query_params import parse_bool_query
from app.schemas.engagement import (
    ActivityList,
    MarkAllReadResponse,
    NotificationList,
)
from app.services import engagement

router = APIRouter()


@router.get("", response_model=NotificationList)
def list_notifications(
    current: CurrentUser,
    db: DbDep,
    category: str | None = Query(default=None),
    unread_only: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
):
    rows = engagement.list_notifications(
        db,
        current.id,
        category=category if category not in (None, "", "undefined", "all") else None,
        unread_only=parse_bool_query(unread_only),
        limit=limit,
    )
    return {
        "notifications": rows,
        "unread_count": engagement.unread_count(db, current.id),
    }


@router.post("/{notif_id}/read", status_code=204)
def mark_read(notif_id: uuid.UUID, current: CurrentUser, db: DbDep):
    ok = engagement.mark_read(db, current.id, notif_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return None


@router.post("/read-all", response_model=MarkAllReadResponse)
def mark_all_read(current: CurrentUser, db: DbDep):
    marked = engagement.mark_all_read(db, current.id)
    return {"marked": marked}


@router.get("/activity", response_model=ActivityList)
def recent_activity(
    current: CurrentUser,
    db: DbDep,
    limit: int = Query(default=20, ge=1, le=50),
):
    rows = engagement.recent_activity(db, current.id, limit=limit)
    return {"activities": rows}
