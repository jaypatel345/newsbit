from typing import Annotated

from app.db.database import get_db
from app.services.search.search_service import SearchService
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/search", tags=["search"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("")
async def search_articles(
    db: DbSession,
    query: str = Query("", description="Search query (e.g., 'Tesla India AI')"),
    strict_and: bool = Query(False, description="Require ALL entities to match"),
    limit: int = Query(
        20, ge=1, le=100, description="Maximum number of articles to return"
    ),
) -> dict:
    """
    Search articles using multi-entity metadata search.

    This endpoint orchestrates the complete metadata search pipeline:
    1. Normalizes and tokenizes the user query
    2. Searches for matching entities in the database
    3. Finds articles that match the entities
    4. Ranks articles by number of matched entities and recency
    5. Returns structured response with matched entity information

    Examples:
    - GET /api/v1/search?query=Tesla%20India
    - GET /api/v1/search?query=Apple%20earnings&strict_and=true
    - GET /api/v1/search?query=SpaceX%20AI&limit=10

    Response format:
    {
      "query": "Tesla India",
      "results": [
        {
          "id": 123,
          "title": "Tesla opens factory in India",
          "match_count": 2,
          "matched_entities": ["Tesla", "India"],
          ...
        }
      ]
    }
    """
    service = SearchService()
    return await service.search(db, query, strict_and=strict_and, limit=limit)
