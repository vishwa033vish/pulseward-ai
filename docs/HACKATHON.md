# PulseWard AI — Hackathon kit

Everything you need to demo, pitch and defend the build in under 5 minutes.

---

## 1. Three-minute live demo script

**0:00 — Hook (landing page)**
> "Every city has the same invisible backlog: potholes, garbage, leaks and broken lights that nobody reports because
> reporting is a phone tree. PulseWard AI turns one photo into a prioritised civic signal."

Scroll slowly through the hero. Point at the 3D city. Mention the Tamil toggle.

**0:25 — The scan (AI Scanner)**
> "Here's the core loop. I'll upload a photo."

Upload a pothole photo → **Analyze**. While it runs:
> "The model returns structured JSON: category, visible evidence, severity, priority and a recommended action. If we
> don't have a Gemini key, a local analyzer keeps the demo alive — and it says so."

Point out the **AI estimate** badge and confidence bar.
> "We never claim certainty. The model sees pixels; it doesn't certify danger."

**0:55 — Structured report (Smart Report Generator)**
Click **Generate smart report**.
> "Notice the report is already drafted, but every field is editable. I pick the exact location on the map — this is
> the piece most civic apps get wrong."

Click the map, tweak the title, hit **Submit**.
> "Report created. In production this goes to Postgres with row-level security; in the demo it stays in this browser
> and says so."

**1:30 — Tracking**
> "Each report has a five-stage timeline: Submitted, Under Review, Assigned, In Progress, Resolved."

Open the report page, expand the priority card.
> "And here's the part judges should scrutinise: the priority is an explainable score, not a number in a black box."

**1:55 — City map**
Go to **City Map**.
> "Every report is on an OpenStreetMap layer, clustered, colour-coded by category, filterable by status and priority.
> Urgent open issues pulse."

Filter to Drainage + Urgent.
> "One click shows the city's drainage risk surface."

**2:25 — Admin command center**
Sign in as **Priya Menon (admin)** → Admin.
> "The other side of the marketplace. Triage every report, assign a department, advance status, and see hotspots and
> recurring patterns — same category repeating in the same area."

Advance a status, assign a department.
> "These actions are demo-only, and the UI says so. No fake government integration."

**2:50 — Assistant**
Open the assistant, ask in Tamil: *"நீர் கசிவை எப்படி புகார் செய்வது?"*
> "Bilingual support isn't a translation layer bolted on top — the assistant answers in Tamil and knows this
> dashboard's data."

**3:00 — Close**
> "PulseWard AI makes reporting effortless and prioritisation transparent. One photo, one map, one shared picture of
> what the city needs next. Thank you."

---

## 2. Architecture explanation (30 seconds, expandable)

> "React + TypeScript frontend with a design system and a local store. The AI key never touches the browser: a FastAPI
> service validates the upload — size, MIME, magic bytes — calls Gemini, then validates the model's JSON with Pydantic
> before returning it. If anything fails, the client falls back to a labelled local heuristic.
>
> The priority engine is a deterministic weighted model shared between client and server, so a judge can reproduce any
> score by hand. And the production schema is Postgres + Supabase with RLS: citizens read all civic reports but can only
> write their own, and only admins move workflow status."

Key files to show: `backend/app/routes/ai.py`, `backend/app/services/priority.py`, `supabase/schema.sql`.

---

## 3. Judge Q&A — prepared answers

**"Is this just a form with an AI wrapper?"**
No. The value is in the pipeline: image → structured analysis → priority score with rationale → map clustering →
workflow → hotspot analytics. The form is the least interesting part; the prioritisation and visibility are the product.

**"How do you stop people spamming reports?"**
Today: file validation, size limits, one report per submit, local demo storage. Roadmap: per-user quotas, rate limiting,
image hashing to detect duplicates, and trust levels for repeat reporters.

**"What if the AI is wrong?"**
Every output is labelled an estimate with a confidence figure, the citizen can override category and priority, and the
final call belongs to a human inspector. We never tell users something is officially dangerous.

**"Why not just use a Google Form?"**
A form produces text. PulseWard produces structured, geolocated, prioritised data that can be clustered, ranked and
plotted — and gives citizens a status timeline instead of silence.

**"Where's the government integration?"**
Deliberately absent. We refuse to fake one. The schema and API are ready for a municipal endpoint; the demo states
clearly that nothing is transmitted.

**"How does this scale?"**
Reads are cheap and cacheable; image analysis is the only expensive call, and it happens once per report. Postgres
with a geo index handles the map queries; clustering is computed client-side per viewport. The AI layer is stateless
and horizontally scalable.

**"What's genuinely novel?"**
The combination of *explainable* priority and *recurrence awareness*. Most civic apps count complaints; we surface that
the same drain has failed four times in one ward — the signal a city actually needs.

**"Business model?"**
Municipal SaaS per ward, plus an open citizen tier. The public map is the growth loop: residents see their street
getting fixed, which drives adoption.

---

## 4. Talking points by theme

| Theme | One-liner |
|---|---|
| Accessibility | Tamil + English UI and assistant, Tanglish accepted, map-first reporting for people who won't type long forms. |
| Trust | Estimates labelled, sample data tagged, demo actions labelled, no fake agency claims. |
| Design | Dark command-center aesthetic, glass panels, motion that respects `prefers-reduced-motion`, 3D only on capable devices. |
| Engineering | Typed end-to-end, shared priority logic, strict AI output validation, image sniffing, graceful degradation. |
| Impact | Turns scattered complaints into a ranked, spatial picture of city needs. |

---

## 5. Pre-demo checklist (5 minutes before pitching)

- [ ] `cd frontend && npm run dev` running, page loaded once (assets warm).
- [ ] A test photo of a pothole saved on the desktop, ready to drag in.
- [ ] Signed in as citizen; `Reset demo data` run if the dataset was modified.
- [ ] Map tiles loaded (internet available) — or note that the demo works without tiles.
- [ ] Assistant has a fresh chat.
- [ ] Browser zoom at 100%, window full screen, notifications silenced.
- [ ] Optional: backend running with `GEMINI_API_KEY` and `VITE_API_URL` set, `/api/health` green.
- [ ] Know your fallback line: "AI backend offline? The local analyzer is running — same flow, clearly labelled."

---

## 6. Post-hackathon roadmap

1. Supabase Realtime for live status updates across devices.
2. Duplicate clustering via embeddings → "12 citizens reported this".
3. Department routing with SLA timers and escalation.
4. Offline PWA queue for low-connectivity wards.
5. Municipal open-data export + ward dashboards.
6. Human-in-the-loop labelling to fine-tune the vision model and calibrate confidence.
