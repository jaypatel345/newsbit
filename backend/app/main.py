from contextlib import asynccontextmanager
from app.scheduler import scheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from .api.v1.news import router as news_router
from app.core.config import settings
from .api.v1.admin_news import router as admin_news_router
from .api.v1.conversations import router as conversations_router
from .api.v1.auth import router as auth_router
from .api.v1.entities import router as entities_router
from .api.v1.search import router as search_router
from .api.v1.article import router as article_router


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Starting scheduler...")
    scheduler.start()

    print("Scheduler started")
    print(scheduler.get_jobs())

    yield

    print("Stopping scheduler...")
    scheduler.shutdown()


app = FastAPI(
    title="Newsbit AI Backend",
    description="Backend for Newsbit AI",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(news_router)
app.include_router(admin_news_router)
app.include_router(conversations_router)
app.include_router(auth_router)
app.include_router(entities_router)
app.include_router(search_router)
app.include_router(article_router)

# Add GZip compression for faster response times
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Newsbit AI Backend is running!"}


@app.get("/health")
def health():
    return {"status": "healthy"}
