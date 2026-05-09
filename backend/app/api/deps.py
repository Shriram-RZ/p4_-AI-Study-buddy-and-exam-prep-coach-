from typing import Annotated
from fastapi import Depends, Request, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User


def get_current_user(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> User:
    token = request.cookies.get(settings.cookie_name)
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    payload = decode_token(token)
    if not payload or payload.get("scope") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
DbDep = Annotated[Session, Depends(get_db)]
