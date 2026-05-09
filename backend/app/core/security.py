from datetime import datetime, timedelta, timezone
from typing import Any
from passlib.context import CryptContext
from jose import jwt, JWTError

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(
    subject: str, minutes: int | None = None, scope: str = "access"
) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=minutes or settings.access_token_minutes
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expires,
        "iat": datetime.now(timezone.utc),
        "scope": scope,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except JWTError:
        return None
