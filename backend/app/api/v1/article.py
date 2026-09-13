from app.db.database import get_db
from app.schemas.article import ArticleResponse
from app.services.content.news.article_audio_service import ArticleAudioService
from app.services.content.news.article_service import ArticleService
from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/api/v1/news/articles",
    tags=["article"],
)


def get_article_service(
    db: AsyncSession = Depends(get_db),
) -> ArticleService:
    return ArticleService(db)


def get_article_audio_service(
    db: AsyncSession = Depends(get_db),
) -> ArticleAudioService:
    return ArticleAudioService(db)


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: int,
    service: ArticleService = Depends(get_article_service),
):
    return await service.get_article_by_id(article_id)


@router.get("/{article_id}/audio")
async def get_article_audio(
    article_id: int,
    service: ArticleAudioService = Depends(get_article_audio_service),
):
    """Return MP3 audio of the article's summary, generating and caching it
    on first request."""
    audio = await service.get_or_create_audio(article_id)
    return Response(
        content=audio.audio_content,
        media_type=audio.mime_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )
