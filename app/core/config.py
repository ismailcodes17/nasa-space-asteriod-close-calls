from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Always load .env from the project root (folder that contains main.py)
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    APP_NAME: str = "Space Close Calls API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    FRONTEND_URL: str = "http://localhost:3000"
    NASA_API_KEY: str = "DEMO_KEY"

    model_config = SettingsConfigDict(env_file=str(ENV_FILE), env_file_encoding="utf-8")


settings = Settings()
