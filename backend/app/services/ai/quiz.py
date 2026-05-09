from app.services.ai.gemini import gemini
from app.services.ai.prompts.quiz import QUIZ_PROMPT


class QuizService:
    @staticmethod
    async def generate(
        topic: str, difficulty: str, count: int, quiz_type: str
    ) -> list[dict]:
        prompt = QUIZ_PROMPT.format(
            topic=topic, difficulty=difficulty, count=count, quiz_type=quiz_type
        )
        data = await gemini.generate_json(prompt, temperature=0.5, max_output_tokens=3000)
        if isinstance(data, dict) and "questions" in data:
            qs = data["questions"]
        elif isinstance(data, list):
            qs = data
        else:
            qs = []

        out: list[dict] = []
        for q in qs[:count]:
            if not isinstance(q, dict):
                continue
            qtype = q.get("type") or quiz_type
            options = list(q.get("options") or [])
            out.append(
                {
                    "question": str(q.get("question", "")).strip(),
                    "type": qtype if qtype in {"mcq", "fill", "theory"} else "mcq",
                    "options": options if qtype == "mcq" else [],
                    "correct_answer": str(q.get("correct_answer", "")).strip(),
                    "explanation": str(q.get("explanation", "")).strip()
                    or "No explanation provided.",
                    "topic_tag": q.get("topic_tag") or topic,
                }
            )
        return out
