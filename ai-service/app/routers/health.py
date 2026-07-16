from fastapi import APIRouter

from app.config import settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Liveness check. The Node.js backend should poll this before routing traffic here."""
    return HealthResponse(app_env=settings.app_env)
