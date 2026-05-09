from datetime import date, timedelta
from app.services.ai.gemini import gemini
from app.services.ai.prompts.planner import PLANNER_PROMPT


class PlannerService:
    @staticmethod
    async def build_schedule(
        exam_name: str,
        exam_date: date,
        daily_hours: float,
        syllabus: str,
        weak_topics: list[str],
    ) -> list[dict]:
        days = max(1, (exam_date - date.today()).days)
        prompt = PLANNER_PROMPT.format(
            exam_name=exam_name,
            exam_date=exam_date.isoformat(),
            days=min(days, 60),
            daily_hours=daily_hours,
            syllabus=syllabus[:6000],
            weak_topics=", ".join(weak_topics) or "(none specified)",
        )
        data = await gemini.generate_json(prompt, temperature=0.4, max_output_tokens=3000)
        if isinstance(data, dict) and "schedule" in data:
            schedule = data["schedule"]
        elif isinstance(data, list):
            schedule = data
        else:
            schedule = []

        # Defensive normalization + ISO date fixup
        start = date.today()
        out: list[dict] = []
        for i, item in enumerate(schedule):
            if not isinstance(item, dict):
                continue
            day = int(item.get("day") or i + 1)
            d_iso = item.get("date") or (start + timedelta(days=day - 1)).isoformat()
            out.append(
                {
                    "day": day,
                    "date": d_iso,
                    "topics": list(item.get("topics") or []),
                    "hours": float(item.get("hours") or daily_hours),
                    "goals": list(item.get("goals") or []),
                    "break_schedule": item.get("break_schedule") or "25/5 Pomodoro",
                }
            )
        return out
