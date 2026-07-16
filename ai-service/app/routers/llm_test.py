import logging

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.core.exceptions import AllProvidersFailedError
from app.core.llm_client import llm_client
from app.schemas.common import LLMStatusResponse, LLMTestRequest, LLMTestResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/llm", tags=["llm"])


@router.get("/status", response_model=LLMStatusResponse)
async def llm_status() -> LLMStatusResponse:
    """Shows which providers are configured, without making an API call. Check this first."""
    return LLMStatusResponse(
        primary_provider=settings.primary_llm_provider,
        configured_providers=settings.configured_providers,
        groq_configured=bool(settings.groq_api_key),
        gemini_configured=bool(settings.gemini_api_key),
    )


@router.post("/test", response_model=LLMTestResponse)
async def llm_test(payload: LLMTestRequest) -> LLMTestResponse:
    """
    Day 1 sanity check: send a real prompt through the fallback chain
    and confirm which provider actually answered.
    """
    try:
        result = await llm_client.generate(prompt=payload.prompt, system=payload.system)
    except AllProvidersFailedError as exc:
        logger.error("All LLM providers failed for /llm/test: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"All configured LLM providers failed. Check your API keys and .env. Details: {exc}",
        ) from exc

    return LLMTestResponse(
        response=result.text,
        provider_used=result.provider,
        model_used=result.model,
        latency_ms=result.latency_ms,
    )
