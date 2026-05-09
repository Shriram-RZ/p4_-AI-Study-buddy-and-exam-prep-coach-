from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.study import router as study_router
from app.api.routes.tutor import router as tutor_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(study_router, prefix="/study", tags=["study"])
api_router.include_router(tutor_router, prefix="/tutor", tags=["tutor"])
