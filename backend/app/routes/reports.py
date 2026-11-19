from fastapi import APIRouter, HTTPException

from app import store
from app.models.schemas import PriorityRequest, PriorityResponse, Report, ReportCreate, StatusUpdate
from app.services.priority import score_priority

router = APIRouter(prefix="/api", tags=["reports"])


@router.get("/reports", response_model=list[Report])
def list_reports() -> list[Report]:
    """Demo in-memory storage. Replace with Supabase + RLS for production."""
    return store.list_reports()


@router.get("/reports/stats")
def report_stats() -> dict:
    return store.stats()


@router.get("/reports/{report_id}", response_model=Report)
def get_report(report_id: str) -> Report:
    report = store.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/reports", response_model=Report, status_code=201)
def create_report(payload: ReportCreate) -> Report:
    return store.create_report(payload)


@router.patch("/reports/{report_id}/status", response_model=Report)
def update_status(report_id: str, payload: StatusUpdate) -> Report:
    report = store.update_status(report_id, payload)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/priority/score", response_model=PriorityResponse)
def priority_score(payload: PriorityRequest) -> PriorityResponse:
    result = score_priority(
        category=payload.category.value,
        severity=payload.severity.value if payload.severity else None,
        description=payload.description,
        nearby_reports=payload.nearby_reports,
        essential_infrastructure=payload.essential_infrastructure,
    )
    return PriorityResponse(**result)
