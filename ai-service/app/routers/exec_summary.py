import json
import logging

from fastapi import APIRouter, HTTPException

from app.agents.exec_summary_agent import generate_exec_summary
from app.schemas.common import ExecSummaryRequest, ExecSummaryResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/exec-summary", tags=["exec-summary"])


@router.post("/generate", response_model=ExecSummaryResponse)
async def generate(req: ExecSummaryRequest) -> ExecSummaryResponse:
    try:
        return await generate_exec_summary(req)
    except json.JSONDecodeError as e:
        logger.error("Exec summary LLM returned invalid JSON: %s", e)
        raise HTTPException(status_code=502, detail=f"AI returned an unparseable summary: {e}")
    except Exception as exc:
        logger.error("Exec summary generation failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Executive summary generation failed: {str(exc)}")
