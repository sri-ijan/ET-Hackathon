import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.agents.rfi_copilot_agent import answer_question, ingest_document
from app.core.exceptions import LLMProviderError
from app.ingestion.extractor import extract_text
from app.rag import vector_store
from app.schemas.common import RFIAskResponse, RFIIngestResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rfi-copilot", tags=["rfi-copilot"])


@router.post("/ingest", response_model=RFIIngestResponse)
async def ingest(document: UploadFile = File(..., description="RFI, spec, or meeting-notes document (PDF or DOCX)")) -> RFIIngestResponse:
    if not document.filename or document.filename.split(".")[-1].lower() not in ("pdf", "docx", "doc"):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX documents are supported.")
    try:
        file_bytes = await document.read()
        text = extract_text(document.filename, file_bytes)
        if not text.strip():
            raise HTTPException(status_code=400, detail=f"{document.filename} contains no extractable text.")
        return await ingest_document(document.filename, text)
    except LLMProviderError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("RFI ingestion failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(exc)}")
    finally:
        await document.close()


@router.get("/corpus-stats")
async def corpus_stats() -> dict:
    return vector_store.corpus_stats()


@router.post("/ask", response_model=RFIAskResponse)
async def ask(question: str = Form(..., description="Natural-language question about the ingested corpus")) -> RFIAskResponse:
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    try:
        return await answer_question(question)
    except LLMProviderError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as exc:
        logger.error("RFI question answering failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"RFI Copilot failed to answer: {str(exc)}")