import logging
import re

from app.models.article import Article
from app.models.article_audio import ArticleAudio
from app.services.infrastructure.voice.tts_service import (
    DEFAULT_VOICE_NAME,
    PAUSE,
    TTSService,
)
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import load_only

logger = logging.getLogger(__name__)


def _article_script(summary: str) -> str:
    """The article's summary, read aloud with no reporter intro - unlike
    the daily brief, this is a single story so it starts directly on the
    content.

    A summary can run to several paragraphs, and the voice would otherwise
    read straight through the breaks between them at the same clip it
    reads a comma. Turning each break into a real pause gives the read the
    paragraph-to-paragraph breathing an anchor has.
    """
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", summary) if p.strip()]
    return f" {PAUSE} ".join(paragraphs)


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

        audio_bytes = await self.tts_service.synthesize_script(
            _article_script(article.summary)
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
