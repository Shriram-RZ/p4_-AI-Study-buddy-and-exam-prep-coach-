from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str = "AI Study Buddy"
    environment: str = "development"
    debug: bool = True

    database_url: str = (
        "postgresql+psycopg2://studybuddy:studybuddy@localhost:5432/studybuddy"
    )

    jwt_secret: str = "change-me-in-prod-please-very-long-secret-key"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24 * 7
    reset_token_minutes: int = 30

    cookie_name: str = "studybuddy_session"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    cookie_domain: str | None = None

    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    gemini_api_key: str = ""
    gemini_model: str = "gemini-flash-latest"
    gemini_base_url: str = (
        "https://generativelanguage.googleapis.com/v1beta/models"
    )

    upload_max_mb: int = 10


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
