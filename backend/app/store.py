"""In-memory demo repository.

This keeps the API demonstrable without Supabase. Swap these functions for
Supabase queries (see supabase/schema.sql) when going live. Process-local state
is intentional for the hackathon build.
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.models.schemas import Report, ReportCreate, Status, StatusUpdate
from app.services.priority import score_priority

REPORTS: Dict[str, Report] = {}


def reset() -> None:
    REPORTS.clear()


def list_reports() -> List[Report]:
    return sorted(REPORTS.values(), key=lambda r: r.created_at, reverse=True)


def get_report(report_id: str) -> Optional[Report]:
    return REPORTS.get(report_id)


def create_report(payload: ReportCreate) -> Report:
    import uuid

    assessment = score_priority(
        category=payload.category.value,
        description=f"{payload.title} {payload.description}",
    )
    now = datetime.now(timezone.utc)
    report = Report(
        id=f"api-{uuid.uuid4().hex[:10]}",
        **payload.model_dump(),
        priority_score=assessment["score"],
        priority_reasons=assessment["reasons"],
        status=Status.submitted,
        created_at=now,
        updated_at=now,
    )
    REPORTS[report.id] = report
    return report


def update_status(report_id: str, payload: StatusUpdate) -> Optional[Report]:
    report = REPORTS.get(report_id)
    if not report:
        return None
    report.status = payload.status
    report.updated_at = datetime.now(timezone.utc)
    REPORTS[report_id] = report
    return report


def stats() -> dict:
    reports = list(REPORTS.values())
    return {
        "total": len(reports),
        "open": len([r for r in reports if r.status != Status.resolved]),
        "resolved": len([r for r in reports if r.status == Status.resolved]),
        "urgent_open": len(
            [r for r in reports if r.priority.value == "Urgent" and r.status != Status.resolved]
        ),
    }
