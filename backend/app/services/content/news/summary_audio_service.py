import json
import logging
from datetime import UTC, datetime, timedelta
from xml.sax.saxutils import escape

from app.core.llm import groq_client02
from app.models.summary import Summary
from app.models.summary_audio import SummaryAudio
from app.prompts.news import BROADCAST_SCRIPT_PROMPT
from app.services.infrastructure.voice.reporter import REPORTER_INTRO
from app.services.infrastructure.voice.tts_service import (
    DEFAULT_VOICE_NAME,
    TTSService,
)
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

INTRO = f"{REPORTER_INTRO} Here's today's brief."

# The home page's "Today's Brief" card only shows the first 5 bullets
# (BriefPreview.tsx: `data?.summary?.slice(0, 5)`). Reading more than that
# aloud means listeners hear stories they never saw on screen, so the audio
# is capped to match. Bullets already come back "most important first" per
# TODAY_BRIEF_PROMPT, so this keeps the top stories either way.
MAX_BULLETS = 5


def _bullet_texts(summary: Summary) -> list[str]:
    try:
        items = json.loads(summary.summary_json)
    except (TypeError, ValueError):
        items = []

    bullets = [item.get("text") if isinstance(item, dict) else item for item in items]
    return [b for b in bullets if b][:MAX_BULLETS]


def _plain_segments(summary: Summary) -> list[str]:
    """Flat fallback script: intro, headline, then each bullet verbatim.
    Used when the broadcast rewrite is unavailable or fails."""
    return [INTRO, summary.headline, *_bullet_texts(summary)]


async def _broadcast_segments(summary: Summary) -> list[str]:
    """Ask the LLM to rewrite the brief as spoken TV-anchor narration.

    Falls back to the flat bullet text if the rewrite fails for any reason
    (rate limit, malformed output, etc.), so a Groq hiccup never blocks
    audio generation - it just sounds less like a broadcast that one time.
    """
    bullets = _bullet_texts(summary)
    if not bullets:
        return _plain_segments(summary)

    try:
        response = await groq_client02.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": BROADCAST_SCRIPT_PROMPT},
                {
                    "role": "user",
                    "content": json.dumps(
                        {"headline": summary.headline, "stories": bullets}
                    ),
                },
            ],
            max_tokens=2500,
        )
        parsed = json.loads(response.choices[0].message.content)
        segments = [
            s.strip()
            for s in parsed.get("segments", [])
            if isinstance(s, str) and s.strip()
        ]
        if not segments:
            raise ValueError("Broadcast rewrite returned no segments")
        return [INTRO, *segments]
    except Exception:
        logger.exception("Broadcast script rewrite failed, using flat script")
        return _plain_segments(summary)


def _segments_to_ssml(segments: list[str]) -> str:
    """Join script segments with a short pause between each and wrap as SSML.
    Chirp3-HD supports <break> and <prosody> but not <emphasis>.

    Each segment already ends in sentence-final punctuation, which Chirp3-HD
    pauses on by itself - stacking a full-length <break> on top of that
    double-pauses and reads as choppy rather than a smooth broadcast flow.
    Keeping the break short lets it add breathing room between stories
    without piling onto the natural pause.
    """
    body = '<break time="250ms"/>'.join(
        escape(segment) for segment in segments if segment.strip()
    )
    return f"<speak>{body}</speak>"


class SummaryAudioService:
    """Serves cached "listen to today's brief" audio for the home page's
    daily summary card, generating it once per Summary row and reusing it
    for every request after that."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.tts_service = TTSService()

    async def _get_current_summary(self) -> Summary | None:
        cutoff = datetime.now(UTC) - timedelta(hours=24)
        result = await self.db.execute(
            select(Summary)
            .where(Summary.updated_at >= cutoff)
            .order_by(Summary.updated_at.desc())
            .limit(1)
        )
        summary = result.scalar_one_or_none()
        if summary is not None:
            return summary

        # Fall back to the most recent one regardless of age, matching
        # NewsService.get_today_summary's behaviour.
        result = await self.db.execute(
            select(Summary).order_by(Summary.updated_at.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_or_create_audio(self) -> SummaryAudio:
        summary = await self._get_current_summary()
        if summary is None:
            raise HTTPException(status_code=404, detail="No brief available yet")

        cached = await self.db.get(SummaryAudio, summary.id)
        if cached is not None:
            return cached

        segments = await _broadcast_segments(summary)
        if not segments:
            raise HTTPException(
                status_code=422,
                detail="Today's brief has no text to read aloud",
            )

        audio_bytes = await self.tts_service.synthesize_ssml(
            _segments_to_ssml(segments)
        )

        audio = SummaryAudio(
            summary_id=summary.id,
            audio_content=audio_bytes,
            mime_type="audio/mpeg",
            voice_name=DEFAULT_VOICE_NAME,
        )
        self.db.add(audio)
        try:
            await self.db.commit()
        except IntegrityError:
            # Another request generated and cached this summary's audio
            # first - use that instead of erroring out.
            await self.db.rollback()
            cached = await self.db.get(SummaryAudio, summary.id)
            if cached is not None:
                return cached
            raise

        await self.db.refresh(audio)
        return audio
