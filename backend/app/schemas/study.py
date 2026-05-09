import uuid
from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, Field


class ScheduleDay(BaseModel):
    day: int
    date: str
    topics: list[str] = []
    hours: float = 1.0
    goals: list[str] = []
    break_schedule: str | None = None


class StudyPlanCreate(BaseModel):
    exam_name: str = Field(min_length=1, max_length=180)
    exam_date: date
    daily_hours: float = Field(ge=0.5, le=14)
    syllabus: str = Field(min_length=10)
    weak_topics: list[str] = []


class StudyPlanOut(BaseModel):
    id: uuid.UUID
    exam_name: str
    exam_date: date
    daily_hours: float
    syllabus: str
    schedule: list[ScheduleDay]
    created_at: datetime

    class Config:
        from_attributes = True


class SummarizeRequest(BaseModel):
    text: str = Field(min_length=20)


class SummarizeResponse(BaseModel):
    summary: str
    key_points: list[str]


class QuizGenerateRequest(BaseModel):
    topic: str = Field(min_length=1)
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    count: int = Field(ge=3, le=25, default=8)
    type: Literal["mcq", "fill", "theory", "mixed"] = "mcq"


class QuizQuestionOut(BaseModel):
    id: uuid.UUID
    type: str
    question: str
    options: list[str] = []
    correct_answer: str
    explanation: str

    class Config:
        from_attributes = True


class QuizOut(BaseModel):
    id: uuid.UUID
    topic: str
    difficulty: str
    questions: list[QuizQuestionOut]
    created_at: datetime

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    answers: dict[str, str]


class QuizReviewItem(BaseModel):
    question_id: str
    correct: bool
    explanation: str


class QuizResultOut(BaseModel):
    score: int
    total: int
    weak_topics: list[str]
    review: list[QuizReviewItem]


class FlashcardGenerate(BaseModel):
    topic: str = Field(min_length=1)
    count: int = Field(ge=5, le=30, default=10)


class FlashcardOut(BaseModel):
    id: uuid.UUID
    topic: str
    front: str
    back: str
    ease: float
    next_review: datetime

    class Config:
        from_attributes = True


class FlashcardReview(BaseModel):
    quality: int = Field(ge=0, le=5)


class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    history: list[ChatMessageOut] = []


class ChatResponse(BaseModel):
    reply: str
    message_id: str
