FLASHCARD_PROMPT = """Create {count} high-quality flashcards on: {topic}

Rules:
1. Each card has a tight question on the front and a 1-3 sentence answer on the back.
2. Mix concept recall, application, and example identification.
3. Avoid duplicates and trivia. Prefer cards a student would re-read 3 weeks before an exam.
4. Use plain language, no fluff.

Return STRICT JSON:
{{
  "cards": [
    {{ "front": "...", "back": "..." }}
  ]
}}
"""
