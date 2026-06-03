import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=120)
    education_level: str | None = Field(default=None, max_length=80)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    education_level: str | None = None
    avatar_url: str | None = None
    daily_study_hours: float = 3.0
    exam_target: str | None = None
    notification_preferences: dict[str, bool] = Field(
        default_factory=lambda: {
            "quiz": True,
            "revision": True,
            "flashcards": True,
            "tutor": True,
        }
    )
    streak: int = 0
    productivity_score: int = 70
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)


class ProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    education_level: str | None = Field(default=None, max_length=80)
    avatar_url: str | None = Field(default=None, max_length=500)
    daily_study_hours: float = Field(ge=0.5, le=14)
    exam_target: str | None = Field(default=None, max_length=180)
    notification_preferences: dict[str, bool] = {}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)
