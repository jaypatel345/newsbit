import logging

from app.core.llm import groq_client
from fastapi import HTTPException
from groq import APIConnectionError, APIStatusError, APITimeoutError

logger = logging.getLogger(__name__)

# whisper-large-v3-turbo is Groq's fastest Whisper tier - low latency matters
# here since this backs live voice input, not a batch job.
DEFAULT_MODEL = "whisper-large-v3-turbo"


class STTService:
    """Thin wrapper around Groq's Whisper transcription API."""

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.webm") -> str:
        """Return the transcribed text for `audio_bytes`.

        Raises HTTPException (422/504/502) on bad input or upstream failure
        so route handlers can just let it propagate.
        """
        if not audio_bytes:
            raise HTTPException(status_code=422, detail="No audio to transcribe")

        try:
            transcription = await groq_client.audio.transcriptions.create(
                model=DEFAULT_MODEL,
                file=(filename, audio_bytes),
            )
        except APITimeoutError as e:
            raise HTTPException(
                status_code=504, detail="Voice transcription timed out"
            ) from e
        except APIStatusError as e:
            logger.error(
                "Groq transcription error %s: %s", e.status_code, e.response.text
            )
            raise HTTPException(
                status_code=502, detail="Voice transcription provider error"
            ) from e
        except APIConnectionError as e:
            logger.exception("Voice transcription request failed")
            raise HTTPException(
                status_code=502, detail="Voice transcription provider error"
            ) from e

        return transcription.text.strip()
