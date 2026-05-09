"""Gemini Flash API client with retries, JSON-mode support, and streaming."""
import asyncio
import json
import logging
from typing import AsyncIterator, Iterable

import httpx

from app.core.config import settings

log = logging.getLogger(__name__)


class GeminiError(Exception):
    pass


class GeminiClient:
    def __init__(self) -> None:
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model
        self.base_url = settings.gemini_base_url
        self._timeout = httpx.Timeout(60.0, connect=10.0)

    def _build_contents(
        self, system: str | None, history: Iterable[dict], message: str
    ) -> list[dict]:
        contents: list[dict] = []
        if system:
            # Gemini uses "system_instruction" separately; include as user prefix here
            contents.append(
                {"role": "user", "parts": [{"text": f"[INSTRUCTIONS]\n{system}"}]}
            )
            contents.append(
                {
                    "role": "model",
                    "parts": [{"text": "Understood. I'll follow these instructions."}],
                }
            )
        for h in history:
            role = "user" if h.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": message}]})
        return contents

    async def generate(
        self,
        prompt: str,
        *,
        system: str | None = None,
        history: Iterable[dict] = (),
        json_mode: bool = False,
        temperature: float = 0.7,
        max_output_tokens: int = 2048,
        retries: int = 2,
    ) -> str:
        if not self.api_key:
            # Graceful fallback so the dev experience stays useful without a key
            log.warning("GEMINI_API_KEY missing — returning stub response")
            return _stub_response(prompt, json_mode)

        url = f"{self.base_url}/{self.model}:generateContent"
        body: dict = {
            "contents": self._build_contents(system, history, prompt),
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_output_tokens,
                "topP": 0.95,
            },
        }
        if json_mode:
            body["generationConfig"]["responseMimeType"] = "application/json"

        last_err: Exception | None = None
        for attempt in range(retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self._timeout) as client:
                    r = await client.post(
                        url,
                        headers={
                            "Content-Type": "application/json",
                            "X-goog-api-key": self.api_key,
                        },
                        json=body,
                    )
                if r.status_code >= 500:
                    raise GeminiError(f"Gemini server error: {r.status_code}")
                if r.status_code == 429:
                    await asyncio.sleep(1.5 * (attempt + 1))
                    continue
                r.raise_for_status()
                data = r.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise GeminiError(f"No candidates: {data}")
                parts = candidates[0].get("content", {}).get("parts", [])
                return "".join(p.get("text", "") for p in parts).strip()
            except Exception as e:
                last_err = e
                if attempt >= retries:
                    break
                await asyncio.sleep(0.6 * (attempt + 1))
        raise GeminiError(f"Gemini failed after retries: {last_err}")

    async def generate_json(self, prompt: str, **kwargs) -> dict | list:
        text = await self.generate(prompt, json_mode=True, **kwargs)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            cleaned = text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.strip("`")
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            try:
                return json.loads(cleaned.strip())
            except Exception as e:
                raise GeminiError(f"Bad JSON from model: {e} :: {text[:300]}")

    async def stream(
        self,
        prompt: str,
        *,
        system: str | None = None,
        history: Iterable[dict] = (),
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        if not self.api_key:
            for chunk in _stub_response(prompt, False).split(" "):
                yield chunk + " "
                await asyncio.sleep(0.02)
            return

        url = f"{self.base_url}/{self.model}:streamGenerateContent?alt=sse"
        body = {
            "contents": self._build_contents(system, history, prompt),
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 2048,
                "topP": 0.95,
            },
        }
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            async with client.stream(
                "POST",
                url,
                headers={
                    "Content-Type": "application/json",
                    "X-goog-api-key": self.api_key,
                },
                json=body,
            ) as r:
                if r.status_code >= 400:
                    text = await r.aread()
                    raise GeminiError(
                        f"Gemini stream error {r.status_code}: {text[:200]!r}"
                    )
                async for line in r.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    payload = line[6:].strip()
                    if not payload or payload == "[DONE]":
                        continue
                    try:
                        obj = json.loads(payload)
                    except json.JSONDecodeError:
                        continue
                    for cand in obj.get("candidates", []):
                        for part in cand.get("content", {}).get("parts", []):
                            t = part.get("text")
                            if t:
                                yield t


gemini = GeminiClient()


def _stub_response(prompt: str, json_mode: bool) -> str:
    """Tiny offline fallback so the app remains usable without an API key."""
    lower = prompt.lower()
    if json_mode:
        if "quiz" in lower or "questions" in lower:
            return json.dumps(
                {
                    "questions": [
                        {
                            "question": "Sample question — set GEMINI_API_KEY for real generation",
                            "type": "mcq",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correct_answer": "0",
                            "explanation": "Stubbed response. Add your Gemini API key to .env.",
                            "topic_tag": "general",
                        }
                    ]
                }
            )
        if "flashcards" in lower:
            return json.dumps(
                {
                    "cards": [
                        {
                            "front": "What is recursion?",
                            "back": "When a function calls itself with a smaller subproblem.",
                        }
                    ]
                }
            )
        if "study plan" in lower or "schedule" in lower:
            return json.dumps(
                {
                    "schedule": [
                        {
                            "day": 1,
                            "date": "2026-01-01",
                            "topics": ["Topic A", "Topic B"],
                            "hours": 2,
                            "goals": ["Understand fundamentals"],
                            "break_schedule": "25/5 Pomodoro",
                        }
                    ]
                }
            )
        if "summary" in lower or "summarize" in lower:
            return json.dumps(
                {
                    "summary": "Stubbed summary — add GEMINI_API_KEY for AI-generated summaries.",
                    "key_points": ["Point 1", "Point 2", "Point 3"],
                }
            )
        return "{}"
    return (
        "I'm running in offline demo mode (no GEMINI_API_KEY set). "
        "Add your key to backend/.env to enable real AI tutoring. "
        "In the meantime, you can explore the UI, study planner and flashcards."
    )
