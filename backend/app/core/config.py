from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    FRONTEND_URL: str
    NEWS_API_URL: str
    NEWS_API_KEY: str
    DATABASE_URL: str
    GROQ_API_KEY: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
