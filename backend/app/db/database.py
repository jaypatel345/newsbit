from collections.abc import AsyncGenerator
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings


class Base(DeclarativeBase):

    pass


def _build_async_database_url(url: str) -> str:
    if not url:
        raise ValueError("DATABASE_URL is empty or not set")
    
    # Handle various database URL formats
    if url.startswith("postgresql://"):
        if "+asyncpg" not in url:
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url
    elif url.startswith("postgres://"):
        if "+asyncpg" not in url:
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url.replace("postgres://", "postgresql://", 1)
    elif "+asyncpg" in url:
        return url
    
    # Default assumption: try to add asyncpg if it's a postgres URL
    if "postgres" in url.lower():
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    return url


try:
    db_url = _build_async_database_url(settings.DATABASE_URL)
    engine = create_async_engine(
        db_url,
        echo=True,
        connect_args={"statement_cache_size": 0},
        pool_pre_ping=True,
        pool_recycle=3600,
    )
except Exception as e:
    raise ValueError(f"Failed to create database engine: {e}. DATABASE_URL may be malformed or empty.")

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
