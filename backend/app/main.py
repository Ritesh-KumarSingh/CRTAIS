"""CRTAIS — FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.mongo import close_mongo
from app.db.postgres import init_db
from app.routers import evaluate, health, materials, rules, sites, simulate


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    print("🚀 CRTAIS API starting...")
    try:
        await init_db()
        print("✓ SQLite database initialized")
    except Exception as e:
        print(f"⚠ Database init failed: {e}")

    print("✓ JSON rule store ready")

    yield

    await close_mongo()
    print("👋 CRTAIS API shutdown complete")


app = FastAPI(
    title=settings.app_title,
    version=settings.app_version,
    description=(
        "Climate-Responsive Traditional Architecture Intelligence System — "
        "API for site management, vernacular rules, and simulation services."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(sites.router)
app.include_router(rules.router)
app.include_router(evaluate.router)
app.include_router(materials.router)
app.include_router(simulate.router)


@app.get("/", tags=["root"])
async def root():
    return {
        "service": "CRTAIS API",
        "version": settings.app_version,
        "docs": "/docs",
    }
