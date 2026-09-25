import json
import logging
from datetime import UTC, datetime, timedelta

from app.core.llm import groq_client02
from app.models.summary import Summary
from app.models.summary_audio import SummaryAudio
from app.prompts.news import BROADCAST_SCRIPT_PROMPT
from app.services.infrastructure.voice.reporter import REPORTER_INTRO
from app.services.infrastructure.voice.tts_service import (
    DEFAULT_VOICE_NAME,
    PAUSE,
    PAUSE_LONG,
    PAUSE_SHORT,
    TTSService,
)
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# Anchors introduce themselves, take a beat, then set up the bulletin - so
# the greeting is two spoken units rather than one run-on line.
INTRO = f"{REPORTER_INTRO} {PAUSE_SHORT} Here's today's brief."

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
    """Flat fallback script: headline, then each bullet verbatim.
    Used when the broadcast rewrite is unavailable or fails."""
    return [summary.headline, *_bullet_texts(summary)]


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
            # A little headroom on temperature keeps the anchor from opening
            # every story the same way, which is what makes a read sound
            # synthetic more than the voice itself does.
            temperature=0.7,
            # Without this the model occasionally answers in prose, the parse
            # below throws, and the listener silently gets the raw bullets
            # read out instead of the broadcast rewrite - the one outcome
            # that undoes the point of this whole step.
            response_format={"type": "json_object"},
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
        return segments
    except Exception:
        logger.exception("Broadcast script rewrite failed, using flat script")
        return _plain_segments(summary)


def _build_script(segments: list[str]) -> str:
    """Lay the greeting and story segments out with broadcast breathing.

    Chirp3-HD pauses on sentence-final punctuation by itself, but only
    briefly and identically everywhere, which is what makes a read sound
    like one long paragraph. Real bulletins are shaped: a long beat after
    the greeting before the first story, a full breath at each story
    boundary, and another long beat before the sign-off. These are markup
    pause tags rather than SSML <break> elements - this voice tier honours
    the former and silently ignores the latter.
    """
    # The rewrite ends on a sign-off segment, but the flat fallback doesn't -
    # and with a single segment there is no story for a sign-off to close.
    # Treat the last segment as one only when something precedes it, so the
    # script never opens on two stacked pauses.
    if len(segments) > 1:
        stories, sign_off = segments[:-1], segments[-1]
    else:
        stories, sign_off = segments, None

    parts = [INTRO, PAUSE_LONG]
    for index, story in enumerate(stories):
        if index:
            parts.append(PAUSE)
        parts.append(story)
    if sign_off:
        parts.extend([PAUSE_LONG, sign_off])

    return " ".join(part for part in parts if part.strip())


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
            if cached.created_at >= summary.updated_at:
                return cached
            # The scheduler regenerates the day's Summary row in place (same
            # id, new headline/bullets) rather than inserting a new row, so
            # a cache keyed only by summary_id would otherwise keep serving
            # yesterday's - or this morning's - narration forever. Drop the
            # stale row and fall through to regenerate.
            await self.db.delete(cached)
            await self.db.flush()

        segments = await _broadcast_segments(summary)
        if not segments:
            raise HTTPException(
                status_code=422,
                detail="Today's brief has no text to read aloud",
            )

        audio_bytes = await self.tts_service.synthesize_script(_build_script(segments))

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
