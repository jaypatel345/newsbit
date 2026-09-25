from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    FRONTEND_URL: str = ""
    NEWS_API_URL: str = ""
    NEWS_API_KEY: str = ""
    DATABASE_URL: str = ""
    GROQ_API_KEY_01: str = ""
    GROQ_API_KEY_02: str = ""
    G_NEWS_API_URL: str = ""
    G_NEWS_API_KEY: str = ""
    TAVILY_API_KEY: str = ""
    GOOGLE_TTS_API_KEY: str = ""
    # Leave empty to use the default Chirp3-HD voice tier (free quota).
    # Set to a Gemini-TTS model - e.g. "gemini-2.5-flash-tts" - to have
    # the reporter's delivery steered by REPORTER_STYLE_DIRECTION as
    # well as by the script. More natural on air, but billed.
    GOOGLE_TTS_MODEL_NAME: str = ""
    SCHEDULER_SECRET: str = "default_secret_change_in_production"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
