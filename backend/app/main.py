import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import admin, agents, auth, subscriptions, users, webhooks
from app.routers import integrations, api_keys
from app.workers.email_worker import start_scheduler, stop_scheduler

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_host = settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else settings.DATABASE_URL
    logger.warning(f"Connecting to database at: {db_host}")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise
    start_scheduler()
    yield
    stop_scheduler()
    await engine.dispose()


app = FastAPI(
    title="AgentFlow API",
    description="Backend for the AgentFlow SaaS — AI agents marketplace",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(agents.router)
app.include_router(subscriptions.router)
app.include_router(webhooks.router)
app.include_router(admin.router)
app.include_router(integrations.router)
app.include_router(api_keys.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
