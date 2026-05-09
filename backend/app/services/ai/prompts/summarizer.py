SUMMARIZER_PROMPT = """Summarize the following study material for revision.

Material:
\"\"\"
{text}
\"\"\"

Rules:
1. Summary: 4-7 sentences, plain language, captures the main ideas a student must remember.
2. Key points: 5-10 bullet items — formulas, definitions, common misconceptions, exam-traps.
3. No fluff. No "in conclusion".

Return STRICT JSON:
{{
  "summary": "...",
  "key_points": ["...", "..."]
}}
"""
