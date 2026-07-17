import asyncio

from fastapi.testclient import TestClient

from app.db.database import get_db
from app.main import app
from app.services.news_service import NewsService


async def override_get_db():
    yield object()


async def fake_fetch_news(self, db):
    return {"ok": True}


def test_fetch_news_route_uses_db_dependency(monkeypatch):
    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(NewsService, "fetch_news", fake_fetch_news)

    with TestClient(app) as client:
        response = client.post("/news/v1/fetch")

    assert response.status_code == 200
    assert response.json() == {"ok": True}

    app.dependency_overrides.clear()


def test_fetch_news_service_handles_no_new_articles(monkeypatch):
    class DummyResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"articles": []}

    class DummyClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, *args, **kwargs):
            return DummyResponse()

    class DummyResult:
        def all(self):
            return []

    class DummyDB:
        def __init__(self):
            self.added = []

        async def execute(self, *args, **kwargs):
            return DummyResult()

        def add(self, obj):
            self.added.append(obj)

        async def commit(self):
            return None

    monkeypatch.setattr("app.services.news_service.AsyncClient", DummyClient)

    service = NewsService()
    result = asyncio.run(service.fetch_news(DummyDB()))

    assert result == {
        "total_fetched": 0,
        "new_articles": 0,
        "duplicates": 0,
    }
