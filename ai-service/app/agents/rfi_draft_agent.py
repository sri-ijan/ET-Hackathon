"""
RFI Drafting Agent.

Takes a single failed/flagged parameter from a Spec Compliance audit (Module 1)
and asks the LLM to draft a formal, submittable Request for Information around
that specific deviation. This is a live LLM call, same as spec_compliance_agent
and rfi_copilot_agent — there is no canned/template fallback, by design: a
fabricated-looking RFI that wasn't actually drafted from the real deviation
would be worse than a loud failure.
"""

import json
import logging
import random
from datetime import datetime, timezone

from app.config import settings
from app.core.llm_client import llm_client
from app.schemas.common import RFIDraftRequest, RFIDraftResponse

logger = logging.getLogger(__name__)

RFI_DRAFT_SYSTEM_PROMPT = """
You are a senior EPC project engineer drafting a formal Request for Information (RFI)
to a vendor, based on a single deviation found during a specification compliance audit.

Rules:

1. Write the way a real project engineer writes an RFI: precise, professional, no
   fluff, and unambiguous about what is being asked of the vendor.
2. Reference the exact specification value and the exact submittal value given to you.
   Never invent numbers, standards, or facts that were not provided.
3. The RFI body must include, in this order:
   - A one-line statement of the discrepancy found.
   - Reference to the governing specification clause/location and the submittal
     clause/location, if provided.
   - A clear, numbered request asking the vendor to either (a) confirm/correct the
     submittal, or (b) provide technical justification for the deviation.
   - A requested response-by timeframe (state "within 5 business days" unless the
     deviation status is 'fail' on a safety/rating-critical parameter, in which case
     use "within 3 business days").
4. Keep the body between 120 and 220 words.
5. Set "recommended_priority" based on severity: rating/capacity/safety-critical
   'fail' parameters are 'high' or 'critical'; other 'fail' parameters are 'medium'
   or 'high'; 'flagged' parameters are 'low' or 'medium'.
6. Return VALID JSON ONLY, no markdown code fences, matching exactly this shape:

{
  "subject": "RFI: Rated Capacity Deviation - Vendor Submittal Below Specification",
  "body": "Full RFI body text here...",
  "recommended_priority": "high"
}
"""

RFI_DRAFT_USER_PROMPT_TEMPLATE = """
Compliance audit finding to draft an RFI for:

Parameter: {parameter_name}
Status: {status}
Required (Specification): {specification_value}
Offered (Vendor Submittal): {submittal_value}
Deviation Reason (from audit): {deviation_reason}
Specification Reference: {location_in_spec}
Submittal Reference: {location_in_submittal}
Specification Document: {specification_file_name}
Vendor Submittal Document: {submittal_file_name}

Draft the RFI now. Return ONLY valid JSON.
"""


def _generate_rfi_number() -> str:
    year = datetime.now(timezone.utc).year
    return f"RFI-{year}-{random.randint(1000, 9999)}"


async def draft_rfi_from_failure(payload: RFIDraftRequest) -> RFIDraftResponse:
    if not settings.configured_providers:
        raise RuntimeError("No AI provider configured. Check your .env (GROQ_API_KEY/GEMINI_API_KEY).")

    prompt = RFI_DRAFT_USER_PROMPT_TEMPLATE.format(
        parameter_name=payload.parameter_name,
        status=payload.status,
        specification_value=payload.specification_value,
        submittal_value=payload.submittal_value,
        deviation_reason=payload.deviation_reason or "Not provided",
        location_in_spec=payload.location_in_spec or "Not specified",
        location_in_submittal=payload.location_in_submittal or "Not specified",
        specification_file_name=payload.specification_file_name or "Governing Specification",
        submittal_file_name=payload.submittal_file_name or "Vendor Submittal",
    )

    logger.info("Drafting RFI for parameter=%s status=%s", payload.parameter_name, payload.status)
    result = await llm_client.generate(
        prompt=prompt,
        system=RFI_DRAFT_SYSTEM_PROMPT,
        temperature=0.2,
        max_tokens=768,
    )

    raw_text = result.text.strip()
    if raw_text.startswith("```json"):
        raw_text = raw_text.split("```json", 1)[1]
    if "```" in raw_text:
        raw_text = raw_text.split("```", 1)[0]
    raw_text = raw_text.strip()

    if not raw_text.endswith("}"):
        raise ValueError("LLM response is incomplete (truncated JSON).")

    parsed = json.loads(raw_text)

    priority = str(parsed.get("recommended_priority", "medium")).strip().lower()
    if priority not in ("low", "medium", "high", "critical"):
        priority = "medium"

    return RFIDraftResponse(
        rfi_number=_generate_rfi_number(),
        subject=parsed.get("subject", f"RFI: {payload.parameter_name} Deviation"),
        body=parsed["body"],
        recommended_priority=priority,
        source="live_llm",
    )