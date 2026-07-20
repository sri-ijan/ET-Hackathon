"""
AI service entrypoint (Roadmap Phase 3).

Run locally:
    uvicorn app.main:app --reload --port 8001

This service is intentionally independent of the Node.js backend and the
frontend — it should start and pass /health with zero other services running.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.logging_config import configure_logging
<<<<<<< HEAD
from app.routers import health, llm_test, spec_compliance, schedule_risk
=======
from app.routers import health, llm_test, spec_compliance, schedule_risk, rfi_copilot
>>>>>>> d243e42 (RAG pipeline sorted)

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="EPC AI Service",
    description="AI/ML backbone for the Data Centre EPC Intelligence Platform (Spec Compliance, Schedule Risk, RFI Copilot, Exec Summary).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(llm_test.router)
app.include_router(spec_compliance.router)
app.include_router(schedule_risk.router)
<<<<<<< HEAD
=======
app.include_router(rfi_copilot.router)
>>>>>>> d243e42 (RAG pipeline sorted)


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("AI service starting | env=%s | primary_llm=%s | configured_providers=%s",
                settings.app_env, settings.primary_llm_provider, settings.configured_providers)
    if not settings.configured_providers:
<<<<<<< HEAD
        logger.warning("No LLM provider API keys found in .env — /llm/test will fail until you set one.")
=======
        logger.warning("No LLM provider API keys found in .env — /llm/test will fail until you set one.")
>>>>>>> d243e42 (RAG pipeline sorted)
