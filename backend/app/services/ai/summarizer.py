from app.services.ai.gemini import gemini
from app.services.ai.prompts.summarizer import SUMMARIZER_PROMPT


class SummarizerService:
    @staticmethod
    async def summarize(text: str) -> dict:
        prompt = SUMMARIZER_PROMPT.format(text=text[:14000])
        data = await gemini.generate_json(prompt, temperature=0.3)
        if not isinstance(data, dict):
            return {"summary": str(data), "key_points": []}
        return {
            "summary": str(data.get("summary", "")).strip(),
            "key_points": [str(k).strip() for k in (data.get("key_points") or [])],
        }
