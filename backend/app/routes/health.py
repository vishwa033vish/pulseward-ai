from fastapi import APIRouter

from app.core.config import get_settings
from app.models.schemas import HealthResponse

router = APIRouter(tags=["system"])

VERSION = "1.0.0"


@router.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        ai_configured=settings.ai_enabled,
        environment=settings.environment,
        version=VERSION,
    )
