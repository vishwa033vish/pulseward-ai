"""Explainable priority scoring — mirrors frontend/src/lib/priority.ts.

Kept dependency-free so it can be unit tested without any AI connection.
"""

from typing import List, Optional

CATEGORY_RISK = {
    "road_damage": 72,
    "garbage": 46,
    "water_leak": 68,
    "streetlight": 58,
    "drainage": 80,
    "infrastructure": 50,
}

SEVERITY_WEIGHT = {"Low": 20, "Moderate": 45, "Severe": 72, "Critical": 92}

SAFETY_KEYWORDS = [
    "accident", "injur", "danger", "child", "school", "hospital", "night", "blind",
    "open manhole", "electric", "fire", "flood", "ஆபத்து", "விபத்து", "குழந்தை",
    "மருத்துவமனை", "இரவு",
]

ESSENTIAL_KEYWORDS = [
    "hospital", "school", "bus stop", "main road", "junction", "market", "temple",
    "station", "மருத்துவமனை", "பள்ளி", "பேருந்து", "சந்திப்பு",
]

CATEGORY_LABEL = {
    "road_damage": "road damage",
    "garbage": "garbage",
    "water_leak": "water leak",
    "streetlight": "streetlight",
    "drainage": "drainage",
    "infrastructure": "public infrastructure",
}


def score_priority(
    category: str,
    severity: Optional[str] = None,
    description: str = "",
    nearby_reports: int = 0,
    essential_infrastructure: Optional[bool] = None,
) -> dict:
    category_weight = CATEGORY_RISK.get(category, 50)
    severity_weight = SEVERITY_WEIGHT.get(severity or "", 45)
    text = (description or "").lower()

    safety_hits = [k for k in SAFETY_KEYWORDS if k in text]
    safety_impact = min(100, 30 + len(safety_hits) * 22)
    nearby = min(max(nearby_reports, 0), 8)
    essential = (
        essential_infrastructure
        if essential_infrastructure is not None
        else any(k in text for k in ESSENTIAL_KEYWORDS)
    )

    raw = (
        category_weight * 0.34
        + severity_weight * 0.36
        + safety_impact * 0.14
        + min(nearby, 6) * 2.2
        + (7 if essential else 0)
    )
    score = max(8, min(100, round(raw)))
    priority = "Urgent" if score >= 80 else "High" if score >= 62 else "Medium" if score >= 40 else "Low"

    reasons: List[str] = [
        f"{CATEGORY_LABEL.get(category, category).title()} carries a baseline public-risk weight of "
        f"{category_weight}/100 in the model.",
    ]
    if severity:
        reasons.append(
            f'Visible severity estimated as "{severity}" ({severity_weight}/100 impact weight).'
        )
    else:
        reasons.append("No image severity estimate available; a neutral severity prior was used.")
    if nearby:
        reasons.append(
            f"{nearby} similar report(s) within ~750 m — recurring issues are weighted higher."
        )
    else:
        reasons.append("No similar reports nearby, so the recurrence weight is minimal.")
    if safety_hits:
        reasons.append(
            "Report text mentions safety-sensitive context ("
            + ", ".join(safety_hits[:3])
            + "), which raises estimated public-safety impact."
        )
    else:
        reasons.append("No explicit safety-sensitive keywords detected in the description.")
    reasons.append(
        "Location appears to serve essential infrastructure."
        if essential
        else "No essential-infrastructure signal detected for this location."
    )

    return {
        "priority": priority,
        "score": score,
        "reasons": reasons,
        "factors": {
            "categoryWeight": category_weight,
            "severityWeight": severity_weight,
            "safetyImpact": safety_impact,
            "nearbyReports": nearby,
            "essentialInfrastructure": essential,
        },
    }
