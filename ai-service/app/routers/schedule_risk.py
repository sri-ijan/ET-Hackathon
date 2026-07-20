import logging
from datetime import date

from fastapi import APIRouter, File, HTTPException, UploadFile, Form

from app.agents.schedule_risk_agent import analyze_schedule_risk
from app.ingestion.schedule_parser import parse_schedule_csv
from app.schemas.common import ScheduleRiskResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/schedule-risk", tags=["schedule-risk"])


@router.post("/analyze", response_model=ScheduleRiskResponse)
async def analyze(
    schedule: UploadFile = File(..., description="Project schedule CSV (task_id, task_name, start_date, end_date, dependency_id, percent_complete)"),
    as_of_date: str | None = Form(default=None, description="Optional YYYY-MM-DD reference date; defaults to today"),
) -> ScheduleRiskResponse:
    if not schedule.filename or not schedule.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for schedule upload.")

    try:
        file_bytes = await schedule.read()
        tasks = parse_schedule_csv(file_bytes)

        reference_date = None
        if as_of_date:
            try:
                reference_date = date.fromisoformat(as_of_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="as_of_date must be in YYYY-MM-DD format.")

        logger.info("Analyzing schedule risk: %d tasks, as_of=%s", len(tasks), reference_date or "today")
        return await analyze_schedule_risk(tasks, reference_date)

    except ValueError as val_err:
        logger.error("Schedule parsing error: %s", val_err)
        raise HTTPException(status_code=400, detail=str(val_err))
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Schedule risk analysis failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Schedule risk analysis failed: {str(exc)}")
    finally:
        await schedule.close()
