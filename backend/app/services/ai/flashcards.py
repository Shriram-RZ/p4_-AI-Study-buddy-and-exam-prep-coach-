from app.services.ai.gemini import gemini
from app.services.ai.prompts.flashcards import FLASHCARD_PROMPT


class FlashcardService:
    @staticmethod
    async def generate(topic: str, count: int) -> list[dict]:
        prompt = FLASHCARD_PROMPT.format(topic=topic, count=count)
        data = await gemini.generate_json(prompt, temperature=0.4)
        if isinstance(data, dict) and "cards" in data:
            cards = data["cards"]
        elif isinstance(data, list):
            cards = data
        else:
            cards = []

        out: list[dict] = []
        for c in cards[:count]:
            if not isinstance(c, dict):
                continue
            front = str(c.get("front", "")).strip()
            back = str(c.get("back", "")).strip()
            if front and back:
                out.append({"front": front, "back": back})
        return out
