import asyncio
import sys

sys.path.insert(0, ".")

from app.core.config import settings
from app.services.content.news.news_service import NewsService
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker


async def test_summary_generation():
    """Test the summary generation function"""
    print("Testing summary generation...")
    print(f"Database URL configured: {bool(settings.DATABASE_URL)}")
    print(f"Groq API Key configured: {bool(settings.GROQ_API_KEY_01)}")
    print(f"Groq API Key 02 configured: {bool(settings.GROQ_API_KEY_02)}")

    if not settings.DATABASE_URL:
        print("❌ DATABASE_URL not configured")
        return

    if not settings.GROQ_API_KEY_02:
        print("❌ GROQ_API_KEY_02 not configured")
        return

    engine = None
    try:
        # Convert postgresql:// to postgresql+asyncpg:// for async operations
        db_url = settings.DATABASE_URL
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        print(f"Using database URL with async driver: {db_url[:50]}...")

        # Create async engine with statement_cache_size=0 to fix pgbouncer error
        engine = create_async_engine(
            db_url,
            echo=True,
            connect_args={"statement_cache_size": 0},
        )
        async_session_maker = sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )

        async with async_session_maker() as db:
            news_service = NewsService(db)

            print("\n🔄 Generating today's summary...")
            result = await news_service.generate_and_save_today_summary()

            print("\n✅ Summary generated successfully!")
            print(f"Summary ID: {result.id}")
            print(f"Headline: {result.headline}")
            print(f"Theme: {result.theme}")
            print(f"Created at: {result.created_at}")
            print(f"Updated at: {result.updated_at}")

            # Print a preview of the summary
            if result.summary_json:
                import json

                summary_data = json.loads(result.summary_json)
                print(f"\n📝 Summary contains {len(summary_data)} articles")
                if summary_data:
                    print(
                        f"First article preview: {summary_data[0].get('text', '')[:200]}..."
                    )

    except Exception as e:
        print(f"\n❌ Error during summary generation: {e}")
        import traceback

        traceback.print_exc()
    finally:
        if engine:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_summary_generation())
