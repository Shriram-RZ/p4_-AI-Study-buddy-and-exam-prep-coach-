import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbDep
from app.core.config import settings
from app.core.security import create_token, hash_password, verify_password
from app.models.user import User, PasswordResetToken
from app.schemas.auth import (
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ProfileUpdateRequest,
    ResetPasswordRequest,
    SignupRequest,
    UserOut,
)

router = APIRouter()


def _set_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        max_age=settings.access_token_minutes * 60,
        path="/",
    )


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(payload: SignupRequest, db: DbDep, response: Response):
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")

    user = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        name=payload.name.strip(),
        education_level=payload.education_level,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(str(user.id))
    _set_cookie(response, token)
    return {"user": UserOut.model_validate(user)}


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: DbDep, response: Response):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    token = create_token(str(user.id))
    _set_cookie(response, token)
    return {"user": UserOut.model_validate(user)}


@router.post("/logout", status_code=204)
def logout(response: Response):
    response.delete_cookie(settings.cookie_name, path="/")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=AuthResponse)
def me(current: CurrentUser):
    return {"user": UserOut.model_validate(current)}


@router.patch("/profile", response_model=AuthResponse)
def update_profile(payload: ProfileUpdateRequest, current: CurrentUser, db: DbDep):
    allowed_prefs = {"quiz", "revision", "flashcards", "tutor"}
    prefs = {
        **(current.notification_preferences or {}),
        **{
            key: bool(value)
            for key, value in payload.notification_preferences.items()
            if key in allowed_prefs
        },
    }
    for key in allowed_prefs:
        prefs.setdefault(key, True)

    current.name = payload.name.strip()
    current.education_level = (
        payload.education_level.strip() if payload.education_level else None
    )
    current.avatar_url = payload.avatar_url.strip() if payload.avatar_url else None
    current.daily_study_hours = payload.daily_study_hours
    current.exam_target = payload.exam_target.strip() if payload.exam_target else None
    current.notification_preferences = prefs
    db.commit()
    db.refresh(current)
    return {"user": UserOut.model_validate(current)}


@router.post("/change-password", status_code=204)
def change_password(
    payload: ChangePasswordRequest, current: CurrentUser, db: DbDep
):
    if not verify_password(payload.current_password, current.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current.password_hash = hash_password(payload.new_password)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: DbDep):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user:
        # Avoid leaking which emails are registered, but still return a token
        # for demo simplicity; in production return 200 with empty body always.
        return {"reset_token": secrets.token_urlsafe(32)}

    token = secrets.token_urlsafe(32)
    rec = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=settings.reset_token_minutes),
    )
    db.add(rec)
    db.commit()
    return {"reset_token": token}


@router.post("/reset-password", status_code=204)
def reset_password(payload: ResetPasswordRequest, db: DbDep):
    rec = db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.token == payload.token)
    )
    if not rec or rec.used:
        raise HTTPException(status_code=400, detail="Invalid or used token")
    if rec.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expired")

    user = db.get(User, rec.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = hash_password(payload.password)
    rec.used = True
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
