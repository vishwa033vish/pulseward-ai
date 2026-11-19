"""PulseWard AI backend.

Run locally:
    cd backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8000

Docs: http://localhost:8000/docs
"""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routes import ai, health, reports

logger = logging.getLogger("pulseward")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

settings = get_settings()

app = FastAPI(
    title="PulseWard AI API",
    description=(
        "AI civic infrastructure triage API: multimodal image analysis with Gemini, "
        "an explainable priority model, a bilingual assistant, and demo report storage."
    ),
    version=health.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(ai.router)
app.include_router(reports.router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Never leak internals (keys, stack traces) to the browser.
    logger.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/")
def root() -> dict:
    return {
        "name": "PulseWard AI API",
        "version": health.VERSION,
        "ai_configured": settings.ai_enabled,
        "docs": "/docs",
        "health": "/api/health",
    }
