QUIZ_PROMPT = """Generate a {difficulty} quiz on: {topic}

Quiz type: {quiz_type}
Number of questions: {count}

Rules:
1. Pitch the difficulty precisely. easy = recall + basic application; medium = multi-step reasoning; hard = synthesis + edge cases.
2. For MCQs: 4 options, exactly one correct, distractors must be plausible (common student mistakes).
3. Include a `topic_tag` for each question — a short sub-topic (e.g. "limits", "newton's-laws", "recursion-base-case").
4. Each `explanation` teaches the concept in 2-3 lines, not just states the answer.
5. No duplicate or near-duplicate questions.
6. correct_answer must be the index (as a string "0"/"1"/"2"/"3") for MCQ, or the literal answer for fill/theory.

Return STRICT JSON:
{{
  "questions": [
    {{
      "question": "...",
      "type": "mcq",
      "options": ["...", "...", "...", "..."],
      "correct_answer": "0",
      "explanation": "...",
      "topic_tag": "..."
    }}
  ]
}}
"""
