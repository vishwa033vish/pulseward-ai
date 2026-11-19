import base64
import binascii
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.core.config import get_settings
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, ChatRequest, ChatResponse
from app.services import gemini

router = APIRouter(prefix="/api/ai", tags=["ai"])

DISCLAIMER = (
    "AI assessment of visible evidence only. It is an estimate, not a verified statement of "
    "structural condition, cause or danger. Confirm details before acting."
)

MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
}


def _decode_image(payload: AnalyzeRequest) -> bytes:
    settings = get_settings()
    raw = payload.image_base64
    if raw.startswith("data:"):
        raw = raw.split(",", 1)[-1]
    try:
        data = base64.b64decode(raw, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 image payload") from exc

    max_bytes = settings.max_image_mb * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail=f"Image exceeds {settings.max_image_mb} MB limit")
    if len(data) < 512:
        raise HTTPException(status_code=400, detail="Image payload is too small to analyse")

    # Content sniffing: never trust the client-provided mime type alone.
    is_jpeg = data.startswith(b"\xff\xd8\xff")
    is_png = data.startswith(b"\x89PNG\r\n\x1a\n")
    is_webp = data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    is_heif = data[4:8] == b"ftyp"
    if not (is_jpeg or is_png or is_webp or is_heif):
        raise HTTPException(status_code=415, detail="Unsupported or unrecognised image format")
    return data


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    settings = get_settings()
    if not settings.ai_enabled:
        raise HTTPException(
            status_code=503,
            detail="AI is not configured. Set GEMINI_API_KEY in backend/.env, or use the frontend demo analyzer.",
        )

    image_bytes = _decode_image(payload)
    try:
        analysis = await gemini.analyze_image(image_bytes, payload.mime_type, payload.filename)
    except gemini.GeminiError as exc:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {exc}") from exc

    # Map to the frontend's camelCase contract.
    analysis_dict = {
        "category": analysis.category.value,
        "description": analysis.description,
        "evidence": analysis.evidence,
        "severity": analysis.severity.value,
        "suggestedPriority": analysis.suggested_priority.value,
        "recommendedAction": analysis.recommended_action,
        "confidence": analysis.confidence,
        "isEstimate": True,
        "source": {"engine": "gemini", "model": settings.gemini_model},
        "disclaimer": DISCLAIMER,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    return AnalyzeResponse(analysis=analysis_dict, model=settings.gemini_model)


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    settings = get_settings()
    if not settings.ai_enabled:
        raise HTTPException(
            status_code=503,
            detail="AI assistant is not configured. Set GEMINI_API_KEY in backend/.env.",
        )
    try:
        reply = await gemini.chat_reply(
            message=payload.message,
            language=payload.language,
            history=[turn.model_dump() for turn in payload.history],
            context=payload.context,
        )
    except gemini.GeminiError as exc:
        raise HTTPException(status_code=502, detail=f"Assistant failed: {exc}") from exc
    if not reply:
        raise HTTPException(status_code=502, detail="Assistant returned an empty reply")
    return ChatResponse(reply=reply)
