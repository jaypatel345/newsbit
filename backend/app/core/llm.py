from app.core.config import settings
from groq import AsyncGroq

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY01)
groq_client02 = AsyncGroq(api_key=settings.GROQ_API_KEY02)
