import io
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile
from pypdf import PdfReader
from sqlalchemy import select

from app.api.deps import CurrentUser, DbDep
from app.models.study import (
    Flashcard,
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

router = APIRouter()


# ---------- Study plans ----------
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
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {
        "plan": {
            "id": plan.id,
            "exam_name": plan.exam_name,
            "exam_date": plan.exam_date.date(),
            "daily_hours": plan.daily_hours,
            "syllabus": plan.syllabus,
            "schedule": plan.schedule,
            "created_at": plan.created_at,
        }
    }


@router.get("/plans")
def list_plans(current: CurrentUser, db: DbDep):
    plans = (
        db.scalars(
            select(StudyPlan)
            .where(StudyPlan.user_id == current.id)
            .order_by(StudyPlan.created_at.desc())
        )
        .all()
    )
    return {
        "plans": [
            {
                "id": p.id,
                "exam_name": p.exam_name,
                "exam_date": p.exam_date.date(),
                "daily_hours": p.daily_hours,
                "syllabus": p.syllabus,
                "schedule": p.schedule,
                "created_at": p.created_at,
            }
            for p in plans
        ]
    }


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
        correct = str(given).strip() == str(q.correct_answer).strip()
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

    db.commit()
    return {
        "score": score,
        "total": len(questions),
        "weak_topics": list(weak_topics.keys()),
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
    db.commit()
    return None


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
