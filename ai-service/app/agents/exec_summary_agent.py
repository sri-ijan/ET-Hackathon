"""
Executive Summary Generator (Module 4, PRD Section 6.4).

By design, this module does ZERO new extraction, retrieval, or scoring — it only
synthesizes whatever Modules 1-3 have already produced (passed in by the backend,
which owns the database) into a single project-pulse summary. This is what makes
it cheap to build: it's a single LLM call over already-computed context.

If there isn't enough data yet (e.g. no modules have been run this session), the
response says so plainly rather than fabricating a status.
"""

import json
import logging

from app.core.llm_client import llm_client
from app.schemas.common import ExecSummaryRequest, ExecSummaryResponse

logger = logging.getLogger(__name__)

EXEC_SUMMARY_SYSTEM_PROMPT = """You are a project management assistant preparing a one-glance
executive summary for a data centre EPC project, for a project manager who has no time to read
the underlying reports.

You will be given: the latest spec compliance summary, the latest schedule risk summary, and
a few recent RFI questions asked by the team. Some of these may be missing (null) — in that case,
just don't reference that module in your synthesis instead of inventing information.

Return VALID JSON ONLY, no markdown fences, matching EXACTLY this shape:

{
  "overall_status": "on_track",
  "headline": "One sentence capturing the overall project pulse.",
  "top_risks": ["Risk 1, plain language", "Risk 2", "Risk 3"],
  "recommended_actions": ["Concrete action 1", "Concrete action 2"],
  "full_summary": "A short paragraph (3-5 sentences) synthesizing everything above for a dashboard card."
}

overall_status must be exactly one of: "on_track", "at_risk", "critical".
- "critical" if compliance has failed parameters AND schedule risk is critical/high.
- "at_risk" if either compliance or schedule shows real problems.
- "on_track" only if both look clean or there isn't enough data to flag concern.

top_risks and recommended_actions should have 2-4 items each. Keep every string
concise — this is a dashboard card, not a report.
"""


def _build_context(req: ExecSummaryRequest) -> str:
    lines = []
    if req.compliance_summary:
        lines.append(f"SPEC COMPLIANCE — {req.compliance_flag_count} non-passing parameter(s):\n{req.compliance_summary}")
    else:
        lines.append("SPEC COMPLIANCE — no compliance check has been run yet this session.")

    if req.schedule_summary:
        lines.append(f"\nSCHEDULE RISK (overall: {req.schedule_overall_risk}):\n{req.schedule_summary}")
    else:
        lines.append("\nSCHEDULE RISK — no schedule analysis has been run yet this session.")

    if req.recent_rfi_questions:
        joined = "; ".join(req.recent_rfi_questions)
        lines.append(f"\nRECENT RFI QUESTIONS ASKED BY THE TEAM: {joined}")
    else:
        lines.append("\nRECENT RFI QUESTIONS — none asked yet this session.")

    return "\n".join(lines)


async def generate_exec_summary(req: ExecSummaryRequest) -> ExecSummaryResponse:
    if not req.compliance_summary and not req.schedule_summary:
        return ExecSummaryResponse(
            overall_status="on_track",
            headline="No module data available yet — run Spec Compliance or Schedule Risk first.",
            top_risks=[],
            recommended_actions=["Run at least one of the Spec Compliance or Schedule Risk modules to generate a real summary."],
            full_summary="This project has no compliance or schedule data yet in this session. "
                         "Upload documents to Spec Compliance or a schedule to Schedule Risk Radar, then regenerate.",
            source="live_llm",
        )

    context = _build_context(req)
    prompt = f"{context}\n\nGenerate the executive summary JSON now."

    result = await llm_client.generate(prompt=prompt, system=EXEC_SUMMARY_SYSTEM_PROMPT, temperature=0.3, max_tokens=800)

    raw_text = result.text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```json", 1)[-1] if "```json" in raw_text else raw_text.split("```", 1)[-1]
    if "```" in raw_text:
        raw_text = raw_text.split("```", 1)[0]

    parsed = json.loads(raw_text.strip())
    parsed["source"] = "live_llm"

    status = str(parsed.get("overall_status", "")).strip().lower()
    parsed["overall_status"] = status if status in ("on_track", "at_risk", "critical") else "at_risk"

    return ExecSummaryResponse(**parsed)
