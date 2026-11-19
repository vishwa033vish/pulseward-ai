from datetime import datetime, timezone
from enum import Enum
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


class Category(str, Enum):
    road_damage = "road_damage"
    garbage = "garbage"
    water_leak = "water_leak"
    streetlight = "streetlight"
    drainage = "drainage"
    infrastructure = "infrastructure"


class Severity(str, Enum):
    low = "Low"
    moderate = "Moderate"
    severe = "Severe"
    critical = "Critical"


class Priority(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    urgent = "Urgent"


class Status(str, Enum):
    submitted = "Submitted"
    under_review = "Under Review"
    assigned = "Assigned"
    in_progress = "In Progress"
    resolved = "Resolved"


# --------------------------------------------------------------------------- #
# AI payloads
# --------------------------------------------------------------------------- #
class AnalyzeRequest(BaseModel):
    image_base64: str = Field(..., min_length=32, description="Base64 image payload, no data-URL prefix")
    mime_type: str = Field(default="image/jpeg")
    filename: str = Field(default="upload.jpg", max_length=200)

    @field_validator("mime_type")
    @classmethod
    def allowed_mime(cls, value: str) -> str:
        allowed = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"}
        if value.lower() not in allowed:
            raise ValueError("Unsupported image type")
        return value.lower()


class AiAnalysis(BaseModel):
    """Strict schema for model output. Anything outside this is rejected."""

    category: Category
    description: str = Field(..., min_length=10, max_length=700)
    evidence: List[str] = Field(default_factory=list, max_length=6)
    severity: Severity
    suggested_priority: Priority
    recommended_action: str = Field(..., min_length=8, max_length=400)
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    is_estimate: bool = True

    @field_validator("evidence")
    @classmethod
    def clean_evidence(cls, items: List[str]) -> List[str]:
        return [i.strip()[:220] for i in items if isinstance(i, str) and i.strip()][:6]


class AnalyzeResponse(BaseModel):
    analysis: dict
    model: str
    engine: Literal["gemini"] = "gemini"


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    language: Literal["en", "ta"] = "en"
    history: List[ChatTurn] = Field(default_factory=list, max_length=20)
    context: dict = Field(default_factory=dict)


class ChatResponse(BaseModel):
    reply: str
    engine: Literal["gemini"] = "gemini"


# --------------------------------------------------------------------------- #
# Reports
# --------------------------------------------------------------------------- #
class ReportCreate(BaseModel):
    title: str = Field(..., min_length=6, max_length=110)
    description: str = Field(..., min_length=20, max_length=800)
    category: Category
    priority: Priority = Priority.medium
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    area: str = Field(..., min_length=2, max_length=160)
    image_url: Optional[str] = None
    ai_analysis: Optional[dict] = None
    user_id: str = "demo-user"
    author_name: str = "Demo guest"


class StatusUpdate(BaseModel):
    status: Status
    note: Optional[str] = Field(default=None, max_length=200)


class Report(BaseModel):
    id: str
    title: str
    description: str
    category: Category
    priority: Priority
    priority_score: int = 0
    priority_reasons: List[str] = Field(default_factory=list)
    status: Status = Status.submitted
    latitude: float
    longitude: float
    area: str
    image_url: Optional[str] = None
    ai_analysis: Optional[dict] = None
    department: Optional[str] = None
    user_id: str
    author_name: str
    is_sample: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PriorityRequest(BaseModel):
    category: Category
    severity: Optional[Severity] = None
    description: str = ""
    nearby_reports: int = Field(default=0, ge=0, le=50)
    essential_infrastructure: Optional[bool] = None


class PriorityResponse(BaseModel):
    priority: Priority
    score: int
    reasons: List[str]
    factors: dict


class HealthResponse(BaseModel):
    status: str
    ai_configured: bool
    environment: str
    version: str
