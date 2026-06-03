import io
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pypdf import PdfReader
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbDep
from app.models.study import (
    Flashcard,
    FlashcardReview as FlashcardReviewLog,
    Quiz,
    QuizQuestion,
    QuizResult,
    StudyPlan,
    UploadedNote,
    AISummary,
    WeakArea,
)
from app.schemas.study import (
    FlashcardGenerate,
    FlashcardOut,
    FlashcardReview,
    PlanUpdate,
    QuizGenerateRequest,
    QuizOut,
    QuizResultOut,
    QuizSubmit,
    StudyPlanCreate,
    StudyPlanOut,
    SummarizeRequest,
    SummarizeResponse,
)
from app.services.ai import (
    FlashcardService,
    PlannerService,
    QuizService,
    SummarizerService,
)
from app.services import engagement

router = APIRouter()


# ---------- Study plans ----------
def _plan_dict(p: StudyPlan) -> dict:
    return {
        "id": p.id,
        "exam_name": p.exam_name,
        "exam_date": p.exam_date.date(),
        "daily_hours": p.daily_hours,
        "syllabus": p.syllabus,
        "schedule": p.schedule,
        "granularity": p.granularity,
        "archived": p.archived,
        "created_at": p.created_at,
    }


@router.post("/plans")
async def create_plan(
    payload: StudyPlanCreate, current: CurrentUser, db: DbDep
):
    schedule = await PlannerService.build_schedule(
        exam_name=payload.exam_name,
        exam_date=payload.exam_date,
        daily_hours=payload.daily_hours,
        syllabus=payload.syllabus,
        weak_topics=payload.weak_topics,
        granularity=payload.granularity,
    )
    plan = StudyPlan(
        user_id=current.id,
        exam_name=payload.exam_name,
        exam_date=datetime.combine(payload.exam_date, datetime.min.time()).replace(
            tzinfo=timezone.utc
        ),
        daily_hours=payload.daily_hours,
        syllabus=payload.syllabus,
        weak_topics=payload.weak_topics,
        schedule=schedule,
        granularity=payload.granularity,
    )
    db.add(plan)
    db.flush()
    unit = {"daily": "day", "weekly": "week", "monthly": "month"}.get(
        payload.granularity, "block"
    )
    engagement.record_event(
        db,
        current.id,
        action="plan_generated",
        category="planner",
        title=f"Study plan ready: {plan.exam_name}",
        summary=f"Generated a {len(schedule)}-{unit} plan for {plan.exam_name}",
        body=f"{len(schedule)} {unit} blocks · {payload.daily_hours}h/day. Weak areas prioritized.",
        link="/dashboard/planner",
        entity_type="study_plan",
        entity_id=plan.id,
    )
    db.commit()
    db.refresh(plan)
    return {"plan": _plan_dict(plan)}


@router.get("/plans")
def list_plans(
    current: CurrentUser, db: DbDep, include_archived: bool = False
):
    stmt = select(StudyPlan).where(StudyPlan.user_id == current.id)
    if not include_archived:
        stmt = stmt.where(StudyPlan.archived.is_(False))
    plans = db.scalars(stmt.order_by(StudyPlan.created_at.desc())).all()
    return {"plans": [_plan_dict(p) for p in plans]}


@router.patch("/plans/{plan_id}")
def update_plan(
    plan_id: uuid.UUID, payload: PlanUpdate, current: CurrentUser, db: DbDep
):
    plan = db.get(StudyPlan, plan_id)
    if not plan or plan.user_id != current.id:
        raise HTTPException(status_code=404, detail="Plan not found")
    if payload.exam_name is not None:
        plan.exam_name = payload.exam_name
    if payload.archived is not None:
        plan.archived = payload.archived
    db.commit()
    db.refresh(plan)
    return {"plan": _plan_dict(plan)}


@router.post("/plans/{plan_id}/duplicate")
def duplicate_plan(plan_id: uuid.UUID, current: CurrentUser, db: DbDep):
    src = db.get(StudyPlan, plan_id)
    if not src or src.user_id != current.id:
        raise HTTPException(status_code=404, detail="Plan not found")
    copy = StudyPlan(
        user_id=current.id,
        exam_name=f"{src.exam_name} (copy)",
        exam_date=src.exam_date,
        daily_hours=src.daily_hours,
        syllabus=src.syllabus,
        weak_topics=src.weak_topics,
        schedule=src.schedule,
        granularity=src.granularity,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return {"plan": _plan_dict(copy)}


@router.delete("/plans/{plan_id}", status_code=204)
def delete_plan(plan_id: uuid.UUID, current: CurrentUser, db: DbDep):
    plan = db.get(StudyPlan, plan_id)
    if not plan or plan.user_id != current.id:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return None


# ---------- Notes summarization ----------
@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(
    payload: SummarizeRequest, current: CurrentUser, db: DbDep
):
    result = await SummarizerService.summarize(payload.text)
    db.add(
        AISummary(
            user_id=current.id,
            summary=result["summary"],
            key_points=result["key_points"],
        )
    )
    engagement.record_event(
        db,
        current.id,
        action="summary_completed",
        category="notes",
        title="Summary ready",
        summary="Summarized pasted notes",
        body=f"{len(result.get('key_points', []))} key points extracted.",
        link="/dashboard/notes",
    )
    db.commit()
    return result


@router.post("/upload-note", response_model=SummarizeResponse)
async def upload_note(
    file: UploadFile, current: CurrentUser, db: DbDep
):
    raw = await file.read()
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    text = ""
    name = file.filename or "upload"
    if name.lower().endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(raw))
            text = "\n".join((p.extract_text() or "") for p in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF parse error: {e}")
    else:
        try:
            text = raw.decode("utf-8", errors="ignore")
        except Exception:
            raise HTTPException(status_code=400, detail="Unsupported file")
    if len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Could not extract enough text")

    note = UploadedNote(user_id=current.id, filename=name, content=text)
    db.add(note)
    db.flush()

    result = await SummarizerService.summarize(text)
    db.add(
        AISummary(
            user_id=current.id,
            note_id=note.id,
            summary=result["summary"],
            key_points=result["key_points"],
        )
    )
    engagement.record_event(
        db,
        current.id,
        action="summary_completed",
        category="notes",
        title=f"Summary ready: {name}",
        summary=f"Summarized uploaded note “{name}”",
        body=f"{len(result.get('key_points', []))} key points extracted.",
        link="/dashboard/notes",
        entity_type="uploaded_note",
        entity_id=note.id,
    )
    db.commit()
    return result


# ---------- Quizzes ----------
@router.post("/quiz")
async def generate_quiz(
    payload: QuizGenerateRequest, current: CurrentUser, db: DbDep
):
    raw_qs = await QuizService.generate(
        topic=payload.topic,
        difficulty=payload.difficulty,
        count=payload.count,
        quiz_type=payload.type,
    )
    if not raw_qs:
        raise HTTPException(status_code=502, detail="Could not generate questions")

    quiz = Quiz(
        user_id=current.id,
        topic=payload.topic,
        difficulty=payload.difficulty,
        quiz_type=payload.type,
    )
    db.add(quiz)
    db.flush()

    questions: list[QuizQuestion] = []
    for i, q in enumerate(raw_qs):
        questions.append(
            QuizQuestion(
                quiz_id=quiz.id,
                question=q["question"],
                type=q["type"],
                options=q["options"],
                correct_answer=q["correct_answer"],
                explanation=q["explanation"],
                topic_tag=q.get("topic_tag"),
                position=i,
            )
        )
    db.add_all(questions)
    engagement.record_event(
        db,
        current.id,
        action="quiz_generated",
        category="quiz",
        title=f"Quiz ready: {quiz.topic}",
        summary=f"Generated a {len(questions)}-question {payload.difficulty} quiz on {quiz.topic}",
        body=f"{len(questions)} questions · {payload.difficulty} · {payload.type}",
        link="/dashboard/quizzes",
        entity_type="quiz",
        entity_id=quiz.id,
    )
    db.commit()
    for q in questions:
        db.refresh(q)
    db.refresh(quiz)

    return {
        "quiz": {
            "id": quiz.id,
            "topic": quiz.topic,
            "difficulty": quiz.difficulty,
            "questions": [
                {
                    "id": q.id,
                    "type": q.type,
                    "question": q.question,
                    "options": q.options,
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation,
                }
                for q in sorted(questions, key=lambda x: x.position)
            ],
            "created_at": quiz.created_at,
        }
    }


@router.post("/quiz/{quiz_id}/submit", response_model=QuizResultOut)
def submit_quiz(
    quiz_id: uuid.UUID,
    payload: QuizSubmit,
    current: CurrentUser,
    db: DbDep,
):
    quiz = db.get(Quiz, quiz_id)
    if not quiz or quiz.user_id != current.id:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = (
        db.scalars(
            select(QuizQuestion)
            .where(QuizQuestion.quiz_id == quiz_id)
            .order_by(QuizQuestion.position)
        )
        .all()
    )
    score = 0
    review = []
    weak_topics: dict[str, int] = {}
    for q in questions:
        given = payload.answers.get(str(q.id), "")
        # Case-insensitive so fill/short answers aren't marked wrong on casing;
        # MCQ answers are index strings so this is a no-op for them.
        correct = str(given).strip().lower() == str(q.correct_answer).strip().lower()
        if correct:
            score += 1
        else:
            tag = q.topic_tag or quiz.topic
            weak_topics[tag] = weak_topics.get(tag, 0) + 1
        review.append(
            {
                "question_id": str(q.id),
                "correct": correct,
                "explanation": q.explanation,
            }
        )

    db.add(
        QuizResult(
            user_id=current.id,
            quiz_id=quiz.id,
            score=score,
            total=len(questions),
            answers=payload.answers,
            weak_topics=list(weak_topics.keys()),
        )
    )

    # Track weak areas
    for tag, miss in weak_topics.items():
        wa = db.scalar(
            select(WeakArea)
            .where(WeakArea.user_id == current.id)
            .where(WeakArea.topic == tag)
        )
        if wa:
            wa.score = max(0.0, min(100.0, wa.score - miss * 5))
            wa.last_practiced = datetime.now(timezone.utc)
        else:
            db.add(
                WeakArea(
                    user_id=current.id,
                    topic=tag,
                    score=max(0.0, 60.0 - miss * 8),
                    recommended_action=f"Generate a {tag} focused quiz",
                )
            )

    total = len(questions)
    pct = round((score / total) * 100) if total else 0
    weak_list = list(weak_topics.keys())
    body = f"You scored {score}/{total} ({pct}%)."
    if weak_list:
        body += f" Weak areas: {', '.join(weak_list[:3])}."
    engagement.record_event(
        db,
        current.id,
        action="quiz_completed",
        category="quiz",
        title=f"Quiz scored: {pct}% on {quiz.topic}",
        summary=f"Completed quiz on {quiz.topic} — {score}/{total} ({pct}%)",
        body=body,
        link="/dashboard/quizzes",
        entity_type="quiz",
        entity_id=quiz.id,
        meta={"score": score, "total": total, "pct": pct, "weak": weak_list},
    )

    db.commit()
    return {
        "score": score,
        "total": total,
        "weak_topics": weak_list,
        "review": review,
    }


# ---------- Flashcards ----------
@router.post("/flashcards")
async def generate_flashcards(
    payload: FlashcardGenerate, current: CurrentUser, db: DbDep
):
    cards = await FlashcardService.generate(payload.topic, payload.count)
    if not cards:
        raise HTTPException(status_code=502, detail="Could not generate flashcards")

    rows: list[Flashcard] = []
    for c in cards:
        rows.append(
            Flashcard(
                user_id=current.id,
                topic=payload.topic,
                front=c["front"],
                back=c["back"],
                next_review=datetime.now(timezone.utc),
            )
        )
    db.add_all(rows)
    engagement.record_event(
        db,
        current.id,
        action="flashcards_ready",
        category="flashcards",
        title=f"{len(rows)} flashcards ready: {payload.topic}",
        summary=f"Generated {len(rows)} flashcards on {payload.topic}",
        body="Your review session is ready. Start now to lock it into memory.",
        link="/dashboard/flashcards",
    )
    db.commit()
    for r in rows:
        db.refresh(r)
    return {
        "flashcards": [
            {
                "id": r.id,
                "topic": r.topic,
                "front": r.front,
                "back": r.back,
                "ease": r.ease,
                "next_review": r.next_review,
            }
            for r in rows
        ]
    }


def _card_dict(c: Flashcard, now: datetime) -> dict:
    mastered = c.repetitions >= 5 or c.interval_days >= 21
    return {
        "id": c.id,
        "topic": c.topic,
        "front": c.front,
        "back": c.back,
        "ease": c.ease,
        "interval_days": c.interval_days,
        "repetitions": c.repetitions,
        "next_review": c.next_review,
        "due": c.next_review <= now,
        "mastered": mastered,
    }


@router.get("/flashcards")
def list_flashcards(
    current: CurrentUser,
    db: DbDep,
    filter: str = Query(default="all"),
):
    now = datetime.now(timezone.utc)
    cards = db.scalars(
        select(Flashcard)
        .where(Flashcard.user_id == current.id)
        .order_by(Flashcard.next_review.asc())
    ).all()
    items = [_card_dict(c, now) for c in cards]
    if filter == "due":
        items = [c for c in items if c["due"]]
    elif filter == "mastered":
        items = [c for c in items if c["mastered"]]
    return {"flashcards": items}


@router.get("/flashcards/stats")
def flashcard_stats(current: CurrentUser, db: DbDep):
    now = datetime.now(timezone.utc)
    cards = db.scalars(
        select(Flashcard).where(Flashcard.user_id == current.id)
    ).all()
    total = len(cards)
    due = sum(1 for c in cards if c.next_review <= now)
    mastered = sum(1 for c in cards if c.repetitions >= 5 or c.interval_days >= 21)

    reviews = db.scalars(
        select(FlashcardReviewLog)
        .where(FlashcardReviewLog.user_id == current.id)
        .order_by(FlashcardReviewLog.reviewed_at.desc())
    ).all()
    total_reviews = len(reviews)
    passed = sum(1 for r in reviews if r.quality >= 3)
    retention = round((passed / total_reviews) * 100) if total_reviews else 0

    # Daily review counts for the last 7 days (oldest -> newest).
    today = now.date()
    daily = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count = sum(1 for r in reviews if r.reviewed_at.date() == d)
        daily.append({"date": d.isoformat(), "count": count})

    # Review streak: consecutive days (ending today) with >= 1 review.
    review_days = {r.reviewed_at.date() for r in reviews}
    streak = 0
    cursor = today
    while cursor in review_days:
        streak += 1
        cursor -= timedelta(days=1)

    return {
        "total": total,
        "due": due,
        "mastered": mastered,
        "total_reviews": total_reviews,
        "retention_rate": retention,
        "review_streak": streak,
        "daily_reviews": daily,
    }


@router.post("/flashcards/{card_id}/review", status_code=204)
def review_flashcard(
    card_id: uuid.UUID,
    payload: FlashcardReview,
    current: CurrentUser,
    db: DbDep,
):
    card = db.get(Flashcard, card_id)
    if not card or card.user_id != current.id:
        raise HTTPException(status_code=404, detail="Card not found")

    # SM-2 spaced repetition
    q = payload.quality
    if q < 3:
        card.repetitions = 0
        card.interval_days = 1
    else:
        card.repetitions += 1
        if card.repetitions == 1:
            card.interval_days = 1
        elif card.repetitions == 2:
            card.interval_days = 6
        else:
            card.interval_days = max(1, int(round(card.interval_days * card.ease)))
        card.ease = max(
            1.3, card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        )
    card.next_review = datetime.now(timezone.utc) + timedelta(days=card.interval_days)

    # Log the review for retention/streak analytics.
    db.add(
        FlashcardReviewLog(user_id=current.id, card_id=card.id, quality=q)
    )

    quality_label = {0: "Again", 1: "Again", 2: "Hard", 3: "Good", 4: "Good", 5: "Easy"}.get(q, "Good")
    engagement.log_activity(
        db,
        current.id,
        action="flashcards_reviewed",
        summary=f"Reviewed a {card.topic} flashcard ({quality_label})",
        entity_type="flashcard",
        entity_id=card.id,
        meta={"quality": q, "interval_days": card.interval_days},
    )
    # Celebrate when a card crosses into long-term retention.
    if card.repetitions >= 5 or card.interval_days >= 21:
        engagement.push_notification(
            db,
            current.id,
            type="streak_increased",
            category="flashcards",
            title=f"Card mastered: {card.topic}",
            body="You've locked this card into long-term memory. 🎉",
            link="/dashboard/flashcards",
        )

    db.commit()
    return None


# ---------- Weak areas ----------
@router.get("/weak-areas")
def list_weak_areas(current: CurrentUser, db: DbDep):
    rows = db.scalars(
        select(WeakArea)
        .where(WeakArea.user_id == current.id)
        .order_by(WeakArea.score.asc())
    ).all()

    out = []
    for w in rows:
        score = round(w.score)
        if score < 45:
            severity, minutes = "critical", 45
        elif score < 65:
            severity, minutes = "high", 30
        else:
            severity, minutes = "moderate", 20
        out.append(
            {
                "topic": w.topic,
                "score": score,
                "severity": severity,
                "suggested_minutes": minutes,
                "last_practiced": w.last_practiced,
                "recommended_action": w.recommended_action
                or f"Run a focused {w.topic} practice round",
            }
        )
    return {"weak_areas": out}


# ---------- Progress ----------
@router.get("/progress")
def get_progress(current: CurrentUser, db: DbDep):
    weak = (
        db.scalars(
            select(WeakArea)
            .where(WeakArea.user_id == current.id)
            .order_by(WeakArea.score.asc())
            .limit(5)
        )
        .all()
    )
    return {
        "streak": current.streak,
        "productivity": current.productivity_score,
        "weekly": [],
        "weak_areas": [{"topic": w.topic, "score": w.score} for w in weak],
    }
