import json
import uuid
from typing import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, DbDep
from app.models.study import ChatHistory
from app.schemas.study import ChatRequest, ChatResponse
from app.services.ai import TutorService, GeminiError

router = APIRouter()


def _hist_for_model(history: list) -> list[dict]:
    out: list[dict] = []
    for m in history[-12:]:
        role = getattr(m, "role", None) or m.get("role")
        content = getattr(m, "content", None) or m.get("content")
        if role and content:
            out.append({"role": role, "content": content})
    return out


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, current: CurrentUser, db: DbDep):
    history = _hist_for_model([m.model_dump() for m in payload.history])
    try:
        reply = await TutorService.reply(payload.message, history)
    except GeminiError as e:
        reply = f"I hit a temporary issue reaching the AI. Please try again. ({e})"

    db.add(ChatHistory(user_id=current.id, role="user", content=payload.message))
    db.add(ChatHistory(user_id=current.id, role="assistant", content=reply))
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
            db.add(
                ChatHistory(user_id=current.id, role="user", content=payload.message)
            )
            db.add(
                ChatHistory(
                    user_id=current.id, role="assistant", content="".join(full)
                )
            )
            db.commit()
        except Exception:
            db.rollback()

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
