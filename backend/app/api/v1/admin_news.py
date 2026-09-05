from typing import Annotated

from app.db.database import get_db
from app.services.infrastructure.external.gnews_service import GNewsService
from app.utils.category_validator import ALLOWED_CATEGORIES
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/admin/news", tags=["admin"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/fetch", response_model=None)
async def test_fetch1(db: DbSession):
    service = GNewsService(db)
    result = await service.sync_top_headlines()
    return {
        "count": len(result),
        "articles": result,
    }


@router.post("/fetch/{category}", response_model=None)
async def test_fetch(category: str, db: DbSession):
    service = GNewsService(db)

    if category == "top":
        articles = await service.sync_top_headlines()
    else:
        # Validate category against allowed categories
        if category not in ALLOWED_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category '{category}'. Must be one of: {', '.join(sorted(ALLOWED_CATEGORIES))}",
            )
        articles = await service.sync_category(category)

    return {
        "category": category,
        "count": len(articles),
        "articles": articles,
    }
