from contextlib import asynccontextmanager
from app.scheduler import scheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.news import router as news_router
from app.core.config import settings
from .api.v1.admin_news import router as admin_news_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="Newsbit AI Backend",
    description="Backend for Newsbit AI",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(news_router)
app.include_router(admin_news_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", settings.FRONTEND_URL],
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
