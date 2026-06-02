import uuid
from datetime import datetime

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: uuid.UUID
    type: str
    category: str
    title: str
    body: str | None = None
    link: str | None = None
    read: bool
    meta: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationList(BaseModel):
    notifications: list[NotificationOut]
    unread_count: int


class ActivityOut(BaseModel):
    id: uuid.UUID
    action: str
    summary: str
    entity_type: str | None = None
    entity_id: uuid.UUID | None = None
    meta: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityList(BaseModel):
    activities: list[ActivityOut]


class MarkAllReadResponse(BaseModel):
    marked: int
