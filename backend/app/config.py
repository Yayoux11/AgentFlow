import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/agentflow"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_PRO: str = ""
    STRIPE_PRICE_ENTERPRISE: str = ""

    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Google OAuth (Gmail)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/integrations/gmail/callback"

    # Microsoft OAuth (Outlook)
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""
    MICROSOFT_TENANT_ID: str = "common"
    MICROSOFT_REDIRECT_URI: str = "http://localhost:8000/integrations/outlook/callback"

    # Fernet key for encrypting OAuth tokens (generate: Fernet.generate_key().decode())
    ENCRYPTION_KEY: str = ""

    # SMTP (reset password emails)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "AgentFlow <noreply@agentflow.io>"

    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    ENVIRONMENT: str = "development"

    # Plan limits: (max_agents, max_requests_per_month) — -1 = unlimited
    PLAN_LIMITS: dict = {
        "starter": {"max_agents": 3, "max_requests": 1000},
        "pro": {"max_agents": -1, "max_requests": 50000},
        "enterprise": {"max_agents": -1, "max_requests": -1},
    }


settings = Settings()

# Safety net: if pydantic-settings missed the env var, override directly from os.environ
if _env_db := os.environ.get("DATABASE_URL"):
    settings.DATABASE_URL = _env_db
