from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central app config, loaded from environment variables / .env file.
    Import `settings` anywhere you need config values.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://seo_user:seo_password@localhost:5434/seo_tool"
    database_url_sync: str = "postgresql://seo_user:seo_password@localhost:5434/seo_tool"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # Auth
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # Third-party
    pagespeed_api_key: str = ""
    anthropic_api_key: str = ""

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    env: str = "development"

    @property
    def parsed_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
