"""Gemini integration over the public REST API (no SDK version lock-in).

The API key lives only in the server environment. Any malformed model output is
rejected and surfaced as a controlled error so the client can fall back.
"""

import json
import re
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import get_settings
from app.models.schemas import AiAnalysis, Priority, Severity

GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

VISION_PROMPT = """You are a civic infrastructure triage assistant analysing a photo submitted by a citizen.

Analyse only what is visible in the image. Identify one category from:
road_damage, garbage, water_leak, streetlight, drainage, infrastructure.

Rules:
- Describe visible evidence only. Never claim certainty about cause, structural condition or danger.
- If the image does not clearly show a civic issue, still choose the closest category but lower the confidence.
- severity is one of: Low, Moderate, Severe, Critical (visible extent only).
- suggested_priority is one of: Low, Medium, High, Urgent.
- confidence is a number between 0 and 1 expressing how reliable YOUR visual assessment is. Use a lower value when the image is unclear, dark or irrelevant.
- is_estimate must be true.
- evidence: 2 to 4 short bullet strings.

Return JSON only with this shape:
{
  "category": "road_damage",
  "description": "one or two sentences describing what is visible",
  "evidence": ["short visible clue", "another clue"],
  "severity": "Moderate",
  "suggested_priority": "Medium",
  "recommended_action": "who should inspect and what to check",
  "confidence": 0.55,
  "is_estimate": true
}"""

CHAT_SYSTEM_PROMPT = """You are PulseWard AI, a civic-tech assistant inside a hackathon demo dashboard.
Help citizens understand civic issues (roads, garbage, water leaks, streetlights, drainage, public infrastructure),
explain how to report a problem, summarise the report data provided, explain explainable priority scoring, and
recommend practical next steps.

Rules:
- Reply in the language requested: English (en) or Tamil (ta). If the user writes Tanglish, reply in simple Tamil.
- Be concise: 2-6 short sentences or a compact list.
- Never claim a report was sent to a real government department. This dashboard is a demo.
- Never guarantee danger or resolution. Priority is an estimate.
- Do not invent report IDs or statistics; use the provided context.
"""


class GeminiError(RuntimeError):
    """Raised when the model is unavailable or returns invalid output."""


def _clean_json(text: str) -> Dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:  # pragma: no cover - defensive
        match = re.search(r"\{.*\}", text, re.S)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        raise GeminiError("Model returned non-JSON output") from exc


def _coerce_analysis(data: Dict[str, Any]) -> AiAnalysis:
    severity_map = {s.lower(): s for s in ("Low", "Moderate", "Severe", "Critical")}
    priority_map = {p.lower(): p for p in ("Low", "Medium", "High", "Urgent")}

    severity = severity_map.get(str(data.get("severity", "")).strip().lower(), "Moderate")
    priority = priority_map.get(
        str(data.get("suggested_priority", "")).strip().lower(), "Medium"
    )
    confidence = data.get("confidence")
    try:
        confidence = None if confidence is None else min(1.0, max(0.0, float(confidence)))
    except (TypeError, ValueError):
        confidence = None

    evidence = data.get("evidence") or []
    if isinstance(evidence, str):
        evidence = [evidence]

    return AiAnalysis(
        category=str(data.get("category", "infrastructure")).strip().lower()
        if str(data.get("category", "")).strip().lower()
        in {
            "road_damage",
            "garbage",
            "water_leak",
            "streetlight",
            "drainage",
            "infrastructure",
        }
        else "infrastructure",
        description=str(data.get("description", "")).strip()[:700] or "No description returned.",
        evidence=[str(e)[:220] for e in evidence][:6],
        severity=Severity(severity),
        suggested_priority=Priority(priority),
        recommended_action=str(data.get("recommended_action", "")).strip()[:400]
        or "Arrange an on-site inspection.",
        confidence=confidence,
        is_estimate=True,
    )


async def _generate(parts: List[Dict[str, Any]], system_prompt: str) -> str:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise GeminiError("GEMINI_API_KEY is not configured")

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1200},
    }

    url = GEMINI_ENDPOINT.format(model=settings.gemini_model)
    async with httpx.AsyncClient(timeout=45.0) as client:
        try:
            res = await client.post(url, params={"key": settings.gemini_api_key}, json=payload)
        except httpx.HTTPError as exc:
            raise GeminiError("Could not reach the Gemini API") from exc

    if res.status_code != 200:
        raise GeminiError(f"Gemini API returned HTTP {res.status_code}")

    try:
        data = res.json()
        parts_out = data["candidates"][0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts_out)
    except (KeyError, IndexError, ValueError) as exc:
        raise GeminiError("Unexpected Gemini response shape") from exc

    if not text.strip():
        raise GeminiError("Gemini returned an empty response")
    return text


async def analyze_image(image_bytes: bytes, mime_type: str, filename: str) -> AiAnalysis:
    import base64

    prompt = VISION_PROMPT + f"\n\nFilename hint (may be misleading): {filename}"
    parts: List[Dict[str, Any]] = [
        {
            "inline_data": {
                "mime_type": mime_type,
                "data": base64.b64encode(image_bytes).decode("ascii"),
            }
        },
        {"text": prompt},
    ]
    text = await _generate(parts, "You output only valid JSON for civic image triage.")
    return _coerce_analysis(_clean_json(text))


async def chat_reply(
    message: str,
    language: str,
    history: List[dict],
    context: Optional[dict] = None,
) -> str:
    lang_instruction = (
        "Reply in Tamil (தமிழ்). Keep technical terms in English when natural."
        if language == "ta"
        else "Reply in clear English."
    )
    context_block = json.dumps(context or {}, ensure_ascii=False)[:2500]
    transcript = "\n".join(
        f"{turn.get('role', 'user')}: {str(turn.get('content', ''))[:600]}" for turn in history[-8:]
    )
    prompt = (
        f"{lang_instruction}\n\nDashboard context (JSON): {context_block}\n\n"
        f"Recent conversation:\n{transcript or '(new conversation)'}\n\n"
        f"Citizen message: {message}"
    )
    return (await _generate([{"text": prompt}], CHAT_SYSTEM_PROMPT)).strip()
