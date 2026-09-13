import logging
from xml.sax.saxutils import escape

from app.models.article import Article
from app.models.article_audio import ArticleAudio
from app.services.infrastructure.voice.reporter import REPORTER_INTRO
from app.services.infrastructure.voice.tts_service import (
    DEFAULT_VOICE_NAME,
    TTSService,
)
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import load_only

logger = logging.getLogger(__name__)


def _article_ssml(summary: str) -> str:
    """Reporter intro (no "today's brief" - this is one story, not the
    daily roundup) followed by the article's summary. Short break instead
    of stacking on the sentence-final pause the voice already adds - see
    SummaryAudioService._segments_to_ssml for why."""
    return (
        f"<speak>{escape(REPORTER_INTRO)}"
        f'<break time="250ms"/>'
        f"{escape(summary)}</speak>"
    )


class ArticleAudioService:
    """Serves cached "listen to this summary" audio, generating it once per
    article on first request and reusing it for every request after that."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.tts_service = TTSService()

    async def get_or_create_audio(self, article_id: int) -> ArticleAudio:
        cached = await self.db.get(ArticleAudio, article_id)
        if cached is not None:
            return cached

        result = await self.db.execute(
            select(Article)
            .options(load_only(Article.id, Article.summary))
            .where(Article.id == article_id)
        )
        article = result.scalar_one_or_none()
        if article is None:
            raise HTTPException(status_code=404, detail="Article not found")
        if not article.summary or not article.summary.strip():
            raise HTTPException(
                status_code=422,
                detail="This article has no summary to read aloud",
            )

        audio_bytes = await self.tts_service.synthesize_ssml(
            _article_ssml(article.summary)
        )

        audio = ArticleAudio(
            article_id=article_id,
            audio_content=audio_bytes,
            mime_type="audio/mpeg",
            voice_name=DEFAULT_VOICE_NAME,
        )
        self.db.add(audio)
        try:
            await self.db.commit()
        except IntegrityError:
            # Another request generated and cached this article's audio
            # first - use that instead of erroring out.
            await self.db.rollback()
            cached = await self.db.get(ArticleAudio, article_id)
            if cached is not None:
                return cached
            raise

        await self.db.refresh(audio)
        return audio
