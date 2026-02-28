"""Health check endpoint."""

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health_check():
    """Basic health check. Returns service status."""
    return {
        "status": "healthy",
        "service": "CRTAIS API",
        "version": "0.1.0",
    }
