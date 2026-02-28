"""CRTAIS Backend configuration via environment variables."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    app_title: str = "CRTAIS"
    app_version: str = "0.1.0"
    cors_origins: List[str] = ["http://localhost:3000"]


settings = Settings()
