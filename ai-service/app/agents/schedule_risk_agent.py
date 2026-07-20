"""
Schedule Risk Radar (Roadmap Phases 12-13, scoped to MVP per the PRD).

Design: risk SCORING is rule-based and deterministic (no LLM in the loop for
the number itself) — this keeps the ranked list reproducible and fast, and
means the module still works with zero LLM calls if needed. The LLM is used
only for the second step: turning the computed metrics into a plain-language
explanation a project manager can read without decoding a scoring formula.

If no LLM provider is configured (or the call fails), a templated explanation
is generated instead, so the module is always demoable — same fallback
philosophy as the Spec Compliance Agent.
"""

import json
import logging
from datetime import date, datetime

from app.config import settings
from app.core.llm_client import llm_client
from app.schemas.common import ScheduleRiskResponse, ScheduleTask, TaskRiskAssessment

logger = logging.getLogger(__name__)

FLAG_THRESHOLD = 25  # risk_score >= this appears in ranked_risks

EXPLANATION_SYSTEM_PROMPT = """You are a senior EPC project scheduler. You will be given a list of
data centre construction tasks that a rule-based system has already flagged as at-risk, along with
the computed metrics behind each flag (days overdue, schedule gap, whether other tasks depend on it).

For each task, write ONE clear, plain-language sentence a project manager could read in 5 seconds,
explaining WHY it's at risk and what the practical consequence is. Do not repeat the raw numbers
verbatim — translate them into consequence-oriented language.

Respond ONLY with a raw JSON object mapping task_id to explanation string, e.g.:
{"T-004": "This task is three weeks behind schedule and blocks UPS installation, putting the go-live date at risk."}
"""


def _parse_date(value: str) -> date:
    try:
        return datetime.strptime(value.strip(), "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"Invalid date '{value}', expected YYYY-MM-DD")


def _score_task(task: ScheduleTask, as_of: date, has_dependents: bool) -> tuple[int, dict]:
    """
    Returns (risk_score 0-100, metrics dict used for both scoring and explanation generation).
    Pure function, no I/O — easy to unit test independently of the LLM/CSV layers.
    """
    start = _parse_date(task.start_date)
    end = _parse_date(task.end_date)

    total_duration_days = max((end - start).days, 1)
    elapsed_days = (as_of - start).days
    expected_pct = 0.0
    if elapsed_days > 0:
        expected_pct = min(100.0, (elapsed_days / total_duration_days) * 100)

    schedule_gap = max(0.0, expected_pct - task.percent_complete)  # how far behind, in percentage points
    days_overdue = max(0, (as_of - end).days) if task.percent_complete < 100 else 0

    score = 0.0
    if days_overdue > 0:
        # Already past the end date and not complete — this is the strongest signal.
        score += min(60, days_overdue * 3)
    score += min(30, schedule_gap * 0.5)  # behind-pace even if not yet overdue
    if has_dependents:
        score *= 1.25  # a delay here cascades — escalate

    score = max(0, min(100, round(score)))

    return int(score), {
        "expected_pct": round(expected_pct, 1),
        "schedule_gap": round(schedule_gap, 1),
        "days_overdue": days_overdue,
    }


def _risk_level(score: int) -> str:
    if score >= 75:
        return "critical"
    if score >= 50:
        return "high"
    if score >= FLAG_THRESHOLD:
        return "medium"
    return "low"


def _templated_reason(task: ScheduleTask, metrics: dict, has_dependents: bool) -> str:
    parts = []
    if metrics["days_overdue"] > 0:
        parts.append(f"{metrics['days_overdue']} days past its end date and only {task.percent_complete:.0f}% complete")
    elif metrics["schedule_gap"] > 0:
        parts.append(f"tracking {metrics['schedule_gap']:.0f} percentage points behind where it should be by now")
    reason = f"{task.task_name} is " + (" and ".join(parts) if parts else "at risk based on current progress") + "."
    if has_dependents:
        reason += " Other tasks depend on this one finishing, so the delay is likely to cascade downstream."
    return reason


async def _generate_llm_explanations(flagged: list[tuple[ScheduleTask, dict, bool]]) -> dict[str, str]:
    """One batched LLM call for all flagged tasks' explanations. Falls back to {} on any failure —
    caller then uses the templated reason per-task, so a flaky LLM never blocks the module."""
    if not settings.configured_providers or not flagged:
        return {}

    task_lines = []
    for task, metrics, has_dependents in flagged:
        task_lines.append(
            f"- task_id={task.task_id}, name=\"{task.task_name}\", days_overdue={metrics['days_overdue']}, "
            f"schedule_gap_pct={metrics['schedule_gap']}, percent_complete={task.percent_complete}, "
            f"has_downstream_dependents={has_dependents}"
        )
    prompt = "Flagged tasks:\n" + "\n".join(task_lines) + "\n\nReturn the JSON object now."

    try:
        result = await llm_client.generate(prompt=prompt, system=EXPLANATION_SYSTEM_PROMPT, temperature=0.2, max_tokens=1024)
        raw = result.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```json", 1)[-1] if "```json" in raw else raw.split("```", 1)[-1]
        if "```" in raw:
            raw = raw.split("```", 1)[0]
        parsed = json.loads(raw.strip())
        if isinstance(parsed, dict):
            return {str(k): str(v) for k, v in parsed.items()}
        return {}
    except Exception as e:
        logger.warning("Schedule risk explanation LLM call failed, using templated reasons instead: %s", e)
        return {}


async def analyze_schedule_risk(tasks: list[ScheduleTask], as_of_date: date | None = None) -> ScheduleRiskResponse:
    as_of = as_of_date or date.today()

    dependents_of = {t.dependency_id for t in tasks if t.dependency_id}

    scored: list[tuple[ScheduleTask, int, dict, bool]] = []
    for task in tasks:
        has_dependents = task.task_id in dependents_of
        score, metrics = _score_task(task, as_of, has_dependents)
        scored.append((task, score, metrics, has_dependents))

    flagged = [(t, m, d) for (t, s, m, d) in scored if s >= FLAG_THRESHOLD]
    flagged_with_scores = [(t, s, m, d) for (t, s, m, d) in scored if s >= FLAG_THRESHOLD]

    llm_explanations = await _generate_llm_explanations([(t, m, d) for (t, m, d) in flagged])

    assessments = []
    for task, score, metrics, has_dependents in flagged_with_scores:
        reason = llm_explanations.get(task.task_id) or _templated_reason(task, metrics, has_dependents)
        assessments.append(
            TaskRiskAssessment(
                task_id=task.task_id,
                task_name=task.task_name,
                end_date=task.end_date,
                percent_complete=task.percent_complete,
                risk_score=score,
                risk_level=_risk_level(score),
                risk_reason=reason,
                has_downstream_dependents=has_dependents,
            )
        )

    assessments.sort(key=lambda a: a.risk_score, reverse=True)

    critical_count = sum(1 for a in assessments if a.risk_level == "critical")
    high_count = sum(1 for a in assessments if a.risk_level == "high")
    if critical_count > 0:
        overall = "critical"
    elif high_count > 0:
        overall = "high"
    elif assessments:
        overall = "medium"
    else:
        overall = "low"

    if assessments:
        summary = (
            f"{len(assessments)} of {len(tasks)} tasks are at risk as of {as_of.isoformat()} "
            f"({critical_count} critical, {high_count} high). "
            f"Top risk: {assessments[0].task_name} ({assessments[0].risk_level})."
        )
    else:
        summary = f"All {len(tasks)} tasks are tracking on schedule as of {as_of.isoformat()}. No risks flagged."

    return ScheduleRiskResponse(
        as_of_date=as_of.isoformat(),
        total_tasks=len(tasks),
        flagged_tasks=len(assessments),
        overall_project_risk=overall,
        summary=summary,
        ranked_risks=assessments,
    )
