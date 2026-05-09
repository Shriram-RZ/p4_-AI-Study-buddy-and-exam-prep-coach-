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
