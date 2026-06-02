import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbDep
from app.models.study import ChatHistory
from app.schemas.study import ChatMessageOut, ChatRequest, ChatResponse
from app.services.ai import TutorService, GeminiError
from app.services import engagement

router = APIRouter()

# Notify the learner when they hit these cumulative tutor-message counts.
_TUTOR_MILESTONES = {10, 25, 50, 100, 250}


def _record_tutor_exchange(db, user_id, question: str) -> None:
    """Log the tutoring activity and raise a milestone notification when the
    user crosses a meaningful number of total tutor exchanges."""
    engagement.log_activity(
        db,
        user_id,
        action="tutor_session",
        summary=f"Asked the AI tutor: {question[:80]}",
        entity_type="tutor",
    )
    prior = (
        db.scalar(
            select(func.count())
            .select_from(ChatHistory)
            .where(
                ChatHistory.user_id == user_id,
                ChatHistory.role == "assistant",
            )
        )
        or 0
    )
    total = prior + 1
    if total in _TUTOR_MILESTONES:
        engagement.push_notification(
            db,
            user_id,
            type="tutor_milestone",
            category="tutor",
            title=f"Tutoring milestone: {total} questions",
            body=f"You've asked the AI tutor {total} questions. Keep the momentum going!",
            link="/dashboard/tutor",
            meta={"count": total},
        )


def _hist_for_model(history: list) -> list[dict]:
    out: list[dict] = []
    for m in history[-12:]:
        role = getattr(m, "role", None) or m.get("role")
        content = getattr(m, "content", None) or m.get("content")
        if role and content:
            out.append({"role": role, "content": content})
    return out


@router.get("/history", response_model=list[ChatMessageOut])
def history(current: CurrentUser, db: DbDep, limit: int = 100):
    rows = (
        db.scalars(
            select(ChatHistory)
            .where(ChatHistory.user_id == current.id)
            .order_by(ChatHistory.created_at.desc())
            .limit(limit)
        )
        .all()
    )
    rows = list(reversed(rows))  # chronological for display
    return [
        ChatMessageOut(
            id=str(r.id),
            role=r.role,
            content=r.content,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, current: CurrentUser, db: DbDep):
    history = _hist_for_model([m.model_dump() for m in payload.history])
    try:
        reply = await TutorService.reply(payload.message, history)
    except GeminiError as e:
        reply = f"I hit a temporary issue reaching the AI. Please try again. ({e})"

    now = datetime.now(timezone.utc)
    db.add(
        ChatHistory(
            user_id=current.id,
            role="user",
            content=payload.message,
            created_at=now,
        )
    )
    db.add(
        ChatHistory(
            user_id=current.id,
            role="assistant",
            content=reply,
            created_at=now + timedelta(milliseconds=1),
        )
    )
    _record_tutor_exchange(db, current.id, payload.message)
    db.commit()
    return {"reply": reply, "message_id": str(uuid.uuid4())}


@router.post("/chat-stream")
async def chat_stream(payload: ChatRequest, current: CurrentUser, db: DbDep):
    history = _hist_for_model([m.model_dump() for m in payload.history])

    async def gen() -> AsyncIterator[bytes]:
        full: list[str] = []
        try:
            async for chunk in TutorService.stream(payload.message, history):
                full.append(chunk)
                yield f"data: {json.dumps({'text': chunk})}\n\n".encode()
        except GeminiError as e:
            yield f"data: {json.dumps({'text': f'[error: {e}]'})}\n\n".encode()
        yield b"data: [DONE]\n\n"

        # Persist after stream finishes
        try:
            now = datetime.now(timezone.utc)
            db.add(
                ChatHistory(
                    user_id=current.id,
                    role="user",
                    content=payload.message,
                    created_at=now,
                )
            )
            db.add(
                ChatHistory(
                    user_id=current.id,
                    role="assistant",
                    content="".join(full),
                    created_at=now + timedelta(milliseconds=1),
                )
            )
            _record_tutor_exchange(db, current.id, payload.message)
            db.commit()
        except Exception:
            db.rollback()

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
