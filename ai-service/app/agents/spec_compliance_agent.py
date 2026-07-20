import json
import logging

from app.config import settings
from app.core.llm_client import llm_client
from app.schemas.common import ParameterComparison, SpecComplianceResponse

logger = logging.getLogger(__name__)

COMPLIANCE_SYSTEM_PROMPT = """
You are an expert EPC Data Centre Engineering Auditor.

Compare the Governing Specification with the Vendor Submittal.

Rules:

1. Extract ONLY the most important engineering parameters.
2. Prioritize:
   - Rated Capacity
   - Voltage
   - Frequency
   - Efficiency
   - Dimensions
   - Weight
   - Protection Rating
   - Standards
   - Material
   - Battery
   - Monitoring
   - Communication
   - Cooling
   - Environmental Limits
   - Warranty

3. Return AT MOST 20 parameters.

4. ALWAYS include every FAIL and FLAGGED parameter.

5. If there are remaining slots, include PASS parameters until the total reaches 20.

6. Never invent values.

7. If a value cannot be found:
   - status = "flagged"
   - deviation_reason = "Information not found in vendor submittal."

8. Locations should be approximate if exact pages are unavailable.

9. Return VALID JSON ONLY.

10. Do NOT wrap JSON inside ```json blocks.

11. Every object inside "parameters" MUST use EXACTLY these field names — do not
    rename, abbreviate, or substitute any of them:
    - "parameter_name"        (string)
    - "specification_value"   (string)
    - "submittal_value"       (string)
    - "status"                (string: "pass", "fail", or "flagged")
    - "deviation_reason"      (string, or null if status is "pass")
    - "location_in_spec"      (string, or null if unknown)
    - "location_in_submittal" (string, or null if unknown)

Return exactly this shape (this is a complete, valid example — match it precisely):

{
  "overall_status": "flagged",
  "summary": "One-paragraph plain-language summary of the audit findings.",
  "parameters": [
    {
      "parameter_name": "Rated Capacity",
      "specification_value": "800 kVA",
      "submittal_value": "750 kVA",
      "status": "fail",
      "deviation_reason": "Proposed capacity is below the 800 kVA required in the specification.",
      "location_in_spec": "Section 2, Page 1",
      "location_in_submittal": "Section 1, Page 1"
    }
  ]
}
"""


COMPLIANCE_USER_PROMPT_TEMPLATE = """
Governing Specification Document
================================
{spec_text}

Vendor Submittal Document
================================
{submittal_text}

Compare these documents according to the system instructions.

Return ONLY valid JSON.
"""

def _unused_generate_mock_comparison(spec_text: str, submittal_text: str) -> SpecComplianceResponse:
    """
    NOT CALLED ANYWHERE. Left here only as reference for what a mock response used to
    look like — this is exactly what was silently reaching the frontend before, coming
    from the Node backend's OWN separate copy of this same mock (backend/src/services/aiService.js),
    not from here. This function itself was already dead code.
    """
    """
    Generates a realistic Spec Compliance check output.
    Contains at least one intentional mismatch to satisfy live demo acceptance criteria.
    It performs basic keyword checks on the text to make the mock output relevant to the uploaded documents.
    """
    spec_lower = spec_text.lower()

    # Detect equipment type to make mock content relevant
    doc_type = "Equipment Unit"
    if "ups" in spec_lower or "battery" in spec_lower:
        doc_type = "Uninterruptible Power Supply (UPS)"
        spec_capacity = "500 kVA"
        submittal_capacity = "400 kVA"
        deviation_reason = "Vendor submittal specifies a capacity of 400 kVA, which is below the 500 kVA required in the specification."
    elif "generator" in spec_lower or "genset" in spec_lower or "engine" in spec_lower:
        doc_type = "Diesel Generator Set"
        spec_capacity = "2000 kW"
        submittal_capacity = "1800 kW"
        deviation_reason = "Vendor offers an 1800 kW standby generator, failing to meet the minimum 2000 kW specification requirement."
    elif "chiller" in spec_lower or "cooling" in spec_lower or "hvac" in spec_lower:
        doc_type = "Water Cooled Chiller"
        spec_capacity = "1200 TR"
        submittal_capacity = "1000 TR"
        deviation_reason = "Submittal specifies a chiller capacity of 1000 TR, which is insufficient for the 1200 TR design requirement."
    else:
        # Default generic engineering spec compliance values
        spec_capacity = "500 kW"
        submittal_capacity = "400 kW"
        deviation_reason = "The vendor submittal provides 400 kW of rated capacity, which is lower than the specified 500 kW requirement."

    parameters = [
        ParameterComparison(
            parameter_name="Equipment Classification",
            specification_value=doc_type,
            submittal_value=doc_type,
            status="pass",
            deviation_reason=None,
            location_in_spec="Section 1.1, Page 1",
            location_in_submittal="Section 1.0, Page 2",
        ),
        ParameterComparison(
            parameter_name="Rated Capacity",
            specification_value=spec_capacity,
            submittal_value=submittal_capacity,
            status="fail",
            deviation_reason=deviation_reason,
            location_in_spec="Section 3.2.1, Page 8",
            location_in_submittal="Section 2.4, Page 5",
        ),
        ParameterComparison(
            parameter_name="Dimensions (LxWxH)",
            specification_value="Max 3000 x 1500 x 2200 mm",
            submittal_value="3100 x 1450 x 2100 mm",
            status="flagged",
            deviation_reason="Length (3100 mm) exceeds the specified maximum of 3000 mm. Requires spatial coordinator review for footprint clearance.",
            location_in_spec="Section 3.5, Page 10",
            location_in_submittal="Data Sheet, Page 11",
        ),
        ParameterComparison(
            parameter_name="Enclosure Protection Rating",
            specification_value="IP54 / NEMA 12",
            submittal_value="IP54",
            status="pass",
            deviation_reason=None,
            location_in_spec="Section 3.6, Page 11",
            location_in_submittal="Section 3.1, Page 7",
        ),
        ParameterComparison(
            parameter_name="Standards Compliance",
            specification_value="IEC 60947, UL 891 listed",
            submittal_value="IEC 60947 certified",
            status="flagged",
            deviation_reason="Missing explicit UL 891 listing documentation in the vendor submittal.",
            location_in_spec="Section 2.1, Page 3",
            location_in_submittal="Section 1.5, Page 3",
        ),
    ]

    summary = f"Compliance audit for {doc_type} identified 1 critical failure (Rated Capacity) and 2 flagged warnings (Dimensions and UL Standards Listing) that require engineering validation before approval."

    return SpecComplianceResponse(overall_status="fail", summary=summary, parameters=parameters)


_PARAMETER_KEY_ALIASES = {
    "parameter_name": ["parameter_name", "name", "parameter", "field", "field_name"],
    "specification_value": ["specification_value", "spec_value", "specification", "required_value", "spec"],
    "submittal_value": ["submittal_value", "vendor_value", "submitted_value", "submittal", "proposed_value", "value"],
    "status": ["status", "compliance_status", "result"],
    "deviation_reason": ["deviation_reason", "reason", "notes", "comment", "explanation"],
    "location_in_spec": ["location_in_spec", "spec_location", "spec_page", "location_spec"],
    "location_in_submittal": ["location_in_submittal", "submittal_location", "submittal_page", "location_submittal"],
}


def _normalize_parameter(raw: dict) -> dict:
    """
    Defensive repair layer for free-tier LLM output drift. Even with an explicit schema
    in the prompt, smaller/free models occasionally rename a key (e.g. "name" instead of
    "parameter_name"). Rather than letting one bad key crash the entire audit with a
    Pydantic validation error, map known aliases onto the expected field names and fill
    safe defaults for anything still missing.
    """
    normalized = {}
    for expected_key, aliases in _PARAMETER_KEY_ALIASES.items():
        value = None
        for alias in aliases:
            if alias in raw and raw[alias] not in (None, ""):
                value = raw[alias]
                break
        normalized[expected_key] = value

    if not normalized["parameter_name"]:
        normalized["parameter_name"] = "Unnamed Parameter"
    if not normalized["specification_value"]:
        normalized["specification_value"] = "Not specified"
    if not normalized["submittal_value"]:
        normalized["submittal_value"] = "Not provided"
    status = str(normalized["status"] or "flagged").strip().lower()
    normalized["status"] = status if status in ("pass", "fail", "flagged") else "flagged"

    return normalized


async def compare_specifications_logic(spec_text: str, submittal_text: str) -> SpecComplianceResponse:
    """
    Core Spec Compliance comparison logic.
    If API keys are set, it makes the actual structured LLM call.
    Otherwise, it falls back to the high-fidelity mock comparison to ensure the demo is functional out-of-the-box.
    """
    # Check if we have active LLM providers configured
    if not settings.configured_providers:
        raise RuntimeError("No AI provider configured. Check your .env (GROQ_API_KEY/GEMINI_API_KEY).")

    # Context truncation if documents are very long
    max_char_len = 15000  # fits well within token limits for Groq/Gemini fallbacks
    truncated_spec = spec_text[:max_char_len]
    if len(spec_text) > max_char_len:
        truncated_spec += "\n... [TRUNCATED DUE TO LENGTH] ..."

    truncated_submittal = submittal_text[:max_char_len]
    if len(submittal_text) > max_char_len:
        truncated_submittal += "\n... [TRUNCATED DUE TO LENGTH] ..."

    prompt = COMPLIANCE_USER_PROMPT_TEMPLATE.format(spec_text=truncated_spec, submittal_text=truncated_submittal)

    try:
        logger.info("Running LLM spec compliance audit...")
        result = await llm_client.generate(
    prompt=prompt,
    system=COMPLIANCE_SYSTEM_PROMPT,
    temperature=0.1,
    max_tokens=3072,
)
        logger.info(result.text)

        # Parse output JSON
        # Standardize JSON extraction in case model wrapped it in markdown codeblocks
        raw_text = result.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text.split("```json", 1)[1]
        if "```" in raw_text:
            raw_text = raw_text.split("```", 1)[0]
        raw_text = raw_text.strip()

        logger.info("Output length: %d", len(raw_text))

        if not raw_text.endswith("}"):
            raise ValueError("LLM response is incomplete (truncated JSON).")        
        
        parsed_data = json.loads(raw_text)
        parsed_data["source"] = "live_llm"  # authoritative — never trust a source field from model output
        parsed_data["parameters"] = [_normalize_parameter(p) for p in parsed_data.get("parameters", [])]

        # Map to Pydantic Response Schema to enforce types & shapes
        return SpecComplianceResponse(**parsed_data)

    except Exception:
     logger.exception("Spec compliance failed")
     raise