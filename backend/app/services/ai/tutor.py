from typing import AsyncIterator
from app.services.ai.gemini import gemini
from app.services.ai.prompts.tutor import TUTOR_SYSTEM


class TutorService:
    @staticmethod
    async def reply(message: str, history: list[dict]) -> str:
        return await gemini.generate(
            message,
            system=TUTOR_SYSTEM,
            history=history[-12:],
            temperature=0.6,
        )

    @staticmethod
    async def stream(message: str, history: list[dict]) -> AsyncIterator[str]:
        async for chunk in gemini.stream(
            message, system=TUTOR_SYSTEM, history=history[-12:], temperature=0.6
        ):
            yield chunk
