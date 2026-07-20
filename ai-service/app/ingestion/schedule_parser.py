"""
Parses a simplified project schedule CSV into structured ScheduleTask rows.

Expected columns (header row required, case-insensitive, order doesn't matter):
    task_id, task_name, start_date, end_date, dependency_id, percent_complete

dependency_id is optional (leave blank for tasks with no predecessor).
Dates must be ISO format: YYYY-MM-DD.
percent_complete is a number 0-100 (the '%' sign, if present, is stripped).

This is a deliberately simple format (Roadmap Phase 12 scoped down per the PRD) —
not a Primavera/MS Project import. Real MS Project/Primavera XML/XER import is
explicitly out of scope for the 7-day MVP.
"""

import csv
import io
import logging

from app.schemas.common import ScheduleTask

logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = {"task_id", "task_name", "start_date", "end_date", "percent_complete"}


def parse_schedule_csv(file_bytes: bytes) -> list[ScheduleTask]:
    try:
        text = file_bytes.decode("utf-8-sig")  # handles Excel's UTF-8 BOM export quirk
    except UnicodeDecodeError as e:
        raise ValueError(f"Could not decode CSV as UTF-8: {e}")

    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        raise ValueError("CSV file appears to be empty or has no header row.")

    normalized_fields = {f.strip().lower(): f for f in reader.fieldnames}
    missing = REQUIRED_COLUMNS - set(normalized_fields.keys())
    if missing:
        raise ValueError(
            f"CSV is missing required column(s): {', '.join(sorted(missing))}. "
            f"Required columns: {', '.join(sorted(REQUIRED_COLUMNS))} (dependency_id is optional)."
        )

    tasks: list[ScheduleTask] = []
    for row_num, row in enumerate(reader, start=2):  # row 1 is the header
        try:
            get = lambda key: (row.get(normalized_fields[key]) or "").strip()  # noqa: E731

            pct_raw = get("percent_complete").replace("%", "").strip()
            dep_raw = get("dependency_id")

            task = ScheduleTask(
                task_id=get("task_id"),
                task_name=get("task_name"),
                start_date=get("start_date"),
                end_date=get("end_date"),
                dependency_id=dep_raw if dep_raw else None,
                percent_complete=float(pct_raw) if pct_raw else 0.0,
            )
            if not task.task_id or not task.task_name:
                raise ValueError("task_id and task_name cannot be empty")

            tasks.append(task)
        except Exception as e:
            raise ValueError(f"Row {row_num} in schedule CSV is invalid: {e}")

    if not tasks:
        raise ValueError("CSV contained a header but no task rows.")

    return tasks
