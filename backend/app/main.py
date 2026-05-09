import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import api_router
from app.core.config import settings
from app.db.session import Base, engine

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # In production, prefer Alembic migrations. For dev, create tables on boot.
    if settings.environment == "development":
        try:
            from app import models  # noqa: F401  ensure models import
            Base.metadata.create_all(bind=engine)
            log.info("Database tables ensured")
        except Exception as e:
            log.warning("Could not create tables: %s", e)
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": settings.app_name, "status": "ok", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(api_router, prefix="/api")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    log.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500, content={"detail": "Internal server error"}
    )
