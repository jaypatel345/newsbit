import base64
import logging
import re

import httpx
from app.core.config import settings
from app.services.infrastructure.voice.reporter import REPORTER_STYLE_DIRECTION
from fastapi import HTTPException

logger = logging.getLogger(__name__)

GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"

# Chirp3-HD is Google's most natural-sounding free voice tier and is covered
# by its "Always Free" monthly quota. See:
# https://cloud.google.com/text-to-speech/docs/chirp3-hd
DEFAULT_VOICE_NAME = "en-US-Chirp3-HD-Aoede"
DEFAULT_LANGUAGE_CODE = "en-US"

# Network anchors read at roughly 150-160 words a minute, a shade under this
# voice tier's default. At 1.0 the delivery clips the ends of sentences and
# runs stories together; 0.94 sits in broadcast range without dragging.
DEFAULT_SPEAKING_RATE = 0.94

# The pause vocabulary our scripts are written in. These are Chirp3-HD's own
# markup tags, and they work ONLY in the request's `markup` input field -
# SSML <break> is silently ignored by this voice tier, so an SSML script
# reads as one flat block no matter how many breaks it contains.
# https://cloud.google.com/text-to-speech/docs/chirp3-hd#pause_control
PAUSE_SHORT = "[pause short]"  # a breath inside a story
PAUSE = "[pause]"  # between two stories
PAUSE_LONG = "[pause long]"  # after the greeting, before the sign-off

_PAUSE_TAGS = (PAUSE_SHORT, PAUSE, PAUSE_LONG)

# Gemini-TTS spells the same three pauses differently.
# https://cloud.google.com/text-to-speech/docs/gemini-tts
_GEMINI_PAUSE_TAGS = {
    PAUSE_SHORT: "[short pause]",
    PAUSE: "[medium pause]",
    PAUSE_LONG: "[long pause]",
}

_BRACKET_TAG_RE = re.compile(r"\[[^\]\n]*\]")
_SSML_TAG_RE = re.compile(r"<[^>\n]+>")
_MARKDOWN_RE = re.compile(r"[*#`]+")


def sanitize_script(script: str) -> str:
    """Strip anything the markup field would read out loud instead of act on.

    The script is assembled from LLM-written copy, so it can arrive with
    leftover markdown, half-remembered SSML, or invented bracket tags
    ("[upbeat]"). Chirp3-HD would speak those literally - "bracket upbeat" -
    so drop every bracketed token except our three real pause tags.
    """
    script = _SSML_TAG_RE.sub(" ", script)
    script = _MARKDOWN_RE.sub("", script)
    # Keep real pause tags, lower-cased: the engines match them literally,
    # so a "[Pause]" the model shouted is a tag neither one acts on.
    script = _BRACKET_TAG_RE.sub(
        lambda m: m.group(0).lower() if m.group(0).lower() in _PAUSE_TAGS else " ",
        script,
    )
    # Markup is plain text, not XML: an un-escaped "&" is fine, but the
    # doubled spaces left behind by the substitutions above are not - they
    # push the voice into an unintended extra beat.
    return re.sub(r"[ \t]{2,}", " ", script).strip()


class TTSService:
    """Thin wrapper around Google Cloud Text-to-Speech's REST API.

    Uses a plain API key (restricted to the Cloud Text-to-Speech API in the
    GCP console) rather than a service-account credential file - much
    simpler to configure as a single Render env var, and the free quota
    applies the same way either way.

    Speaks scripts written in the pause vocabulary above. Two engines are
    supported and chosen by config:

    * Chirp3-HD (default, free quota) - honours the pause tags and the
      broadcast speaking rate.
    * Gemini-TTS (set GOOGLE_TTS_MODEL_NAME, e.g. "gemini-2.5-flash-tts") -
      additionally takes a style direction in the request's `prompt` field,
      so the delivery itself can be steered to news-anchor read rather than
      only its pacing. Not on the free tier.
    """

    def __init__(self):
        self.api_key = settings.GOOGLE_TTS_API_KEY
        self.model_name = settings.GOOGLE_TTS_MODEL_NAME.strip()
        self.timeout = 30.0

    @property
    def _uses_style_prompt(self) -> bool:
        return self.model_name.startswith("gemini")

    async def synthesize_script(
        self,
        script: str,
        voice_name: str = DEFAULT_VOICE_NAME,
        language_code: str = DEFAULT_LANGUAGE_CODE,
        speaking_rate: float = DEFAULT_SPEAKING_RATE,
    ) -> bytes:
        """Return MP3 audio bytes for a script written with the pause tags."""
        script = sanitize_script(script or "")
        if not script:
            raise HTTPException(status_code=422, detail="No text to read aloud")

        if self._uses_style_prompt:
            for neutral, gemini in _GEMINI_PAUSE_TAGS.items():
                script = script.replace(neutral, gemini)
            # Gemini-TTS takes the bare voice name plus a model, where
            # Chirp3-HD takes a fully qualified one - reuse the same
            # character ("...-Chirp3-HD-Aoede" -> "Aoede") so switching
            # engines doesn't silently change who the listener hears.
            voice_name = voice_name.rsplit("-", 1)[-1]
            input_field = {
                "prompt": REPORTER_STYLE_DIRECTION,
                "text": script,
            }
        else:
            input_field = {"markup": script}

        return await self._call(input_field, voice_name, language_code, speaking_rate)

    async def _call(
        self,
        input_field: dict,
        voice_name: str,
        language_code: str,
        speaking_rate: float,
    ) -> bytes:
        """Request/error-handling shared by both engines.

        Raises HTTPException (503/422/504/502) on misconfiguration or
        upstream failure so route handlers can just let it propagate.
        """
        if not self.api_key:
            raise HTTPException(
                status_code=503, detail="Text-to-speech is not configured"
            )

        voice: dict = {"languageCode": language_code, "name": voice_name}
        if self.model_name:
            voice["modelName"] = self.model_name

        payload = {
            "input": input_field,
            "voice": voice,
            "audioConfig": {
                "audioEncoding": "MP3",
                "speakingRate": speaking_rate,
            },
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
