import math
from datetime import date, timedelta

from app.services.ai.gemini import gemini
from app.services.ai.prompts.planner import PLANNER_PROMPT

# How many blocks each granularity produces, and how many days each spans.
_GRANULARITY = {
    "daily": {"unit": "day", "span": 1, "max_blocks": 30},
    "weekly": {"unit": "week", "span": 7, "max_blocks": 16},
    "monthly": {"unit": "month", "span": 30, "max_blocks": 12},
}


class PlannerService:
    @staticmethod
    async def build_schedule(
        exam_name: str,
        exam_date: date,
        daily_hours: float,
        syllabus: str,
        weak_topics: list[str],
        granularity: str = "daily",
    ) -> list[dict]:
        cfg = _GRANULARITY.get(granularity, _GRANULARITY["daily"])
        days = max(1, (exam_date - date.today()).days)
        blocks = max(1, min(cfg["max_blocks"], math.ceil(days / cfg["span"])))

        prompt = PLANNER_PROMPT.format(
            exam_name=exam_name,
            exam_date=exam_date.isoformat(),
            days=days,
            blocks=blocks,
            unit=cfg["unit"],
            granularity=granularity,
            daily_hours=daily_hours,
            syllabus=syllabus[:6000],
            weak_topics=", ".join(weak_topics) or "(none specified)",
        )
        # Use the client's larger default JSON budget so the full block list
        # isn't truncated (the old 3000-token cap silently cut long plans).
        data = await gemini.generate_json(prompt, temperature=0.4)
        if isinstance(data, dict) and "schedule" in data:
            schedule = data["schedule"]
        elif isinstance(data, list):
            schedule = data
        else:
            schedule = []

        start = date.today()
        span = cfg["span"]
        out: list[dict] = []
        for i, item in enumerate(schedule):
            if not isinstance(item, dict):
                continue
            day_index = i + 1
            d_iso = item.get("date") or (start + timedelta(days=i * span)).isoformat()
            priority = str(item.get("priority") or "medium").lower()
            if priority not in ("high", "medium", "low"):
                priority = "medium"
            out.append(
                {
                    "day": day_index,
                    "period": item.get("period") or f"{cfg['unit'].title()} {day_index}",
                    "date": d_iso,
                    "topics": list(item.get("topics") or []),
                    "hours": float(item.get("hours") or daily_hours),
                    "priority": priority,
                    "goals": list(item.get("goals") or []),
                    "revision": list(item.get("revision") or []),
                    "break_schedule": item.get("break_schedule") or "25/5 Pomodoro",
                }
            )
        return out
