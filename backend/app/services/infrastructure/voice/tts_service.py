import base64
import logging

import httpx
from app.core.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"

# Chirp3-HD is Google's most natural-sounding voice tier and is covered by
# its "Always Free" monthly quota. See:
# https://cloud.google.com/text-to-speech/docs/chirp3-hd
DEFAULT_VOICE_NAME = "en-US-Chirp3-HD-Aoede"
DEFAULT_LANGUAGE_CODE = "en-US"


class TTSService:
    """Thin wrapper around Google Cloud Text-to-Speech's REST API.

    Uses a plain API key (restricted to the Cloud Text-to-Speech API in the
    GCP console) rather than a service-account credential file - much
    simpler to configure as a single Render env var, and the free quota
    applies the same way either way.
    """

    def __init__(self):
        self.api_key = settings.GOOGLE_TTS_API_KEY
        self.timeout = 20.0

    async def synthesize(
        self,
        text: str,
        voice_name: str = DEFAULT_VOICE_NAME,
        language_code: str = DEFAULT_LANGUAGE_CODE,
    ) -> bytes:
        """Return MP3 audio bytes for plain `text`."""
        if not text or not text.strip():
            raise HTTPException(status_code=422, detail="No text to read aloud")
        return await self._call({"text": text}, voice_name, language_code)

    async def synthesize_ssml(
        self,
        ssml: str,
        voice_name: str = DEFAULT_VOICE_NAME,
        language_code: str = DEFAULT_LANGUAGE_CODE,
    ) -> bytes:
        """Return MP3 audio bytes for an SSML document (e.g. `<speak>...</speak>`
        with `<break>`/`<prosody>` tags - both supported by Chirp3-HD)."""
        if not ssml or not ssml.strip():
            raise HTTPException(status_code=422, detail="No text to read aloud")
        return await self._call({"ssml": ssml}, voice_name, language_code)

    async def _call(
        self, input_field: dict, voice_name: str, language_code: str
    ) -> bytes:
        """Shared request/error-handling for both input types.

        Raises HTTPException (503/422/504/502) on misconfiguration or
        upstream failure so route handlers can just let it propagate.
        """
        if not self.api_key:
            raise HTTPException(
                status_code=503, detail="Text-to-speech is not configured"
            )

        payload = {
            "input": input_field,
            "voice": {"languageCode": language_code, "name": voice_name},
            "audioConfig": {"audioEncoding": "MP3"},
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    GOOGLE_TTS_URL,
                    params={"key": self.api_key},
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
        except httpx.TimeoutException as e:
            raise HTTPException(
                status_code=504, detail="Text-to-speech timed out"
            ) from e
        except httpx.HTTPStatusError as e:
            logger.error(
                "Google TTS error %s: %s",
                e.response.status_code,
                e.response.text,
            )
            raise HTTPException(
                status_code=502, detail="Text-to-speech provider error"
            ) from e
        except httpx.HTTPError as e:
            logger.exception("Text-to-speech request failed")
            raise HTTPException(
                status_code=502, detail="Text-to-speech provider error"
            ) from e

        audio_b64 = data.get("audioContent")
        if not audio_b64:
            raise HTTPException(
                status_code=502, detail="Text-to-speech returned no audio"
            )

        return base64.b64decode(audio_b64)
