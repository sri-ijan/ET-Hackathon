import logging
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.agents.spec_compliance_agent import compare_specifications_logic
from app.ingestion.extractor import extract_text
from app.schemas.common import SpecComplianceResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/spec-compliance", tags=["spec-compliance"])


@router.post("/compare", response_model=SpecComplianceResponse)
async def compare_specifications(
    specification: UploadFile = File(..., description="Governing specification document (PDF or DOCX)"),
    submittal: UploadFile = File(..., description="Vendor submittal document (PDF or DOCX)"),
) -> SpecComplianceResponse:
    """
    Accepts governing specification and vendor submittal documents, extracts text content,
    and runs a side-by-side compliance parameter audit.
    """
    try:
        # Check file extensions
        for doc in (specification, submittal):
            if not doc.filename:
                raise HTTPException(status_code=400, detail="Invalid file: missing filename.")
            ext = doc.filename.split(".")[-1].lower()
            if ext not in ("pdf", "docx", "doc"):
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file format for {doc.filename}. Only PDF and DOCX documents are allowed.",
                )

        logger.info(
            "Starting compliance audit: spec=%s, submittal=%s",
            specification.filename,
            submittal.filename,
        )

        # Read uploaded files in-memory
        spec_bytes = await specification.read()
        submittal_bytes = await submittal.read()

        # Perform text extraction
        spec_text = extract_text(specification.filename, spec_bytes)
        submittal_text = extract_text(submittal.filename, submittal_bytes)

        if not spec_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Governing specification document contains no extractable text.",
            )
        if not submittal_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Vendor submittal document contains no extractable text.",
            )

        # Run AI/LLM or fallback mock audit analysis
        result = await compare_specifications_logic(spec_text, submittal_text)
        return result

    except ValueError as val_err:
        logger.exception("LLM spec compliance check failed")
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        logger.error("Spec compliance audit process failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Compliance check failed: {str(exc)}")
    finally:
        # Close file handles to free up system resources
        await specification.close()
        await submittal.close()
