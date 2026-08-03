from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    FRONTEND_URL: str
    NEWS_API_URL: str
    NEWS_API_KEY: str
    DATABASE_URL: str
    GROQ_API_KEY: str
    G_NEWS_API_URL: str
    G_NEWS_API_KEY: str
    GROQ_API_KEY01: str
    SCHEDULER_SECRET: str = "default_secret_change_in_production"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
