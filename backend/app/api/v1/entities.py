from typing import Annotated, Any

from app.db.database import get_db
from app.schemas.entity import EntitySearchResponse
from app.services.entities.entity_service import EntityService
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/entities", tags=["entities"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("/search", response_model=list[EntitySearchResponse])
async def search_entities(
    db: DbSession,
    q: str = Query(..., description="Search query for entity name"),
) -> list[EntitySearchResponse]:
    """
    Search entities by name.

    Performs exact normalized match first, then falls back to case-insensitive partial match.
    """
    service = EntityService()
    return await service.search_entities(db, q)


@router.get("/{entity_id}/articles")
async def get_articles_by_entity(
    entity_id: int,
    db: DbSession,
    limit: int = Query(
        20, ge=1, le=100, description="Maximum number of articles to return"
    ),
) -> list[dict[str, Any]]:
    """
    Get all articles associated with a specific entity.

    Returns articles ordered by published_at DESC.
    """
    service = EntityService()
    articles = await service.get_articles_by_entity(db, entity_id, limit)

    if not articles:
        raise HTTPException(
            status_code=404, detail=f"No articles found for entity {entity_id}"
        )

    return [
        {
            "id": article.id,
            "title": article.title,
            "summary": article.summary,
            "url": article.url,
            "published_at": article.published_at,
            "source_name": article.source_name,
            "image_url": article.image_url,
            "category": article.category,
        }
        for article in articles
    ]
