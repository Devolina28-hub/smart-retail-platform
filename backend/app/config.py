"""
Centralized application configuration.
Reads from environment variables (populated via .env / docker-compose).
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Database ---
    DATABASE_URL: str = "postgresql://retail_admin:change_me_local_only@localhost:5432/smart_retail"

    # --- Auth ---
    JWT_SECRET_KEY: str = "insecure-dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- App ---
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # --- Storage paths ---
    UPLOAD_DIR: str = "data"
    CUSTOMER_FACE_DIR: str = "data/customers"
    PRODUCT_IMAGE_DIR: str = "data/products"
    MODEL_DIR: str = "models_store"

    # --- ML thresholds ---
    FACE_MATCH_TOLERANCE: float = 0.5
    SENTIMENT_MIN_CONFIDENCE: float = 0.55
    CHATBOT_MIN_CONFIDENCE: float = 0.35

    # --- Optional OAuth ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
