# PulseWard AI

*Designed and built by Vishwa S.*

**Building Smarter Cities. Together.**

PulseWard AI is a working civic-tech prototype: take a photo of a pothole, garbage pile, water leak, broken
streetlight or blocked drain, and the platform turns it into a structured, map-located, prioritised report. Citizens
track progress; administrators triage, assign and analyse the city's issue patterns.

Built for a Smart City hackathon. It runs **end-to-end with zero API keys** (demo mode) and upgrades to real Gemini
vision analysis with a single backend environment variable.

> **Honesty by design.** Reports are never sent to a real municipality in this build. Sample data is labelled,
> AI output is marked as an estimate, and no screen claims real-world resolution.

---

## 1. What is actually implemented

| Area | Status | Where |
|---|---|---|
| Landing page with animated 3D smart-city hero, scroll reveals, counters | ✅ | `frontend/src/pages/Landing.tsx`, `components/CityScene.tsx` |
| Citizen dashboard: KPIs, trend, category & status charts, recent activity, my reports | ✅ | `pages/Dashboard.tsx` |
| AI Scanner: drag & drop upload, preview, replace/remove, analysis, confidence | ✅ | `pages/Scanner.tsx` |
| Smart Report Generator: prefilled editable report, validation, save draft, cancel, submit | ✅ | `pages/Composer.tsx` |
| Interactive Leaflet map: clustering, category/status/priority filters, search, legend, popups, click-to-pick location | ✅ | `components/MapView.tsx`, `pages/CityMap.tsx` |
| Report tracking with 5-stage visual timeline and detail pages | ✅ | `pages/Tracking.tsx`, `pages/TrackingDetail.tsx` |
| AI Priority Intelligence: explainable 0–100 score, factor breakdown, what-if simulator | ✅ | `pages/Priority.tsx`, `lib/priority.ts` |
| Admin Command Center: search/filter all reports, status workflow, department assignment, hotspots, recurring issues, analytics map | ✅ | `pages/Admin.tsx` |
| AI assistant: chat UI, typing indicator, history, clear chat, suggestions, English + Tamil/Tanglish | ✅ | `components/AssistantPanel.tsx`, `pages/AssistantPage.tsx` |
| Backend: FastAPI + Gemini vision/chat, validation, image sniffing, graceful 503/502 fallbacks | ✅ | `backend/app/**` |
| Database schema with RLS, triggers, storage policies | ✅ | `supabase/schema.sql` |
| Demo mode with labelled sample data and simulated workflow | ✅ | `lib/demoData.ts`, `store/AppStore.tsx` |
| Toasts, modals, empty states, loading states, confirmations, reduced-motion support, responsive layout | ✅ | throughout |

### What is *simulated* on purpose
- Demo sign-in (role switch stored in `localStorage`). Supabase Auth is scaffolded in the schema, not wired to the UI.
- Department assignment and status changes are local demo actions.
- The landing-page statistics are illustrative, not municipal data.
- No SMS/email/agency integration.

---

## 2. Tech stack

**Frontend:** React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · Framer Motion · Three.js + React Three Fiber
(hero only, lazy-loaded) · Leaflet + React Leaflet + OpenStreetMap (CARTO dark tiles) · Recharts · Lucide React ·
React Router 6

**Backend:** Python 3.11+ · FastAPI · Pydantic v2 · httpx (Gemini REST) · Uvicorn

**Data:** Supabase / PostgreSQL schema with Row Level Security, storage bucket policies and triggers.
In demo mode the browser persists reports in `localStorage`.

**AI:** Google Gemini (`gemini-2.0-flash`) for multimodal image analysis and bilingual chat. Optional — a local
heuristic analyzer keeps the demo working without it.

---

## 3. Architecture

```
┌──────────────────────────────── Browser ────────────────────────────────┐
│  React SPA (Vite)                                                       │
│                                                                         │
│  pages/  ──►  store/AppStore (reports, profile, language, draft, toasts)│
│                    │                                                    │
│                    ├── localStorage   (demo persistence)                 │
│                    ├── lib/priority.ts (explainable scoring, shared with │
│                    │                    the backend implementation)      │
│                    └── lib/api.ts ────► FastAPI  (only if VITE_API_URL)   │
│                                           │                             │
│  lib/demoAI.ts (fallback) ◄───────────────┘  Gemini REST ──► Google AI   │
│  local image statistics + bilingual rules                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                       Supabase (optional production path)
                        Postgres + RLS + Storage
```

**Why this shape?** The frontend never holds an AI key. Every sensitive call goes through the FastAPI service, which
validates the image (size, MIME, magic bytes) and validates the model's JSON against a strict Pydantic schema. If the
backend or key is absent, the UI degrades to a clearly-labelled local estimate instead of breaking — critical for a
live hackathon demo on unknown Wi-Fi.

**Priority model** (identical in `frontend/src/lib/priority.ts` and `backend/app/services/priority.py`):

| Signal | Weight |
|---|---|
| Category baseline risk (drainage 80, roads 72, water 68, lights 58, infra 50, waste 46) | 34% |
| Visible severity (Low → Critical) | 36% |
| Safety context keywords (school, night, accident, open manhole…) | 14% |
| Similar reports within ~750 m | up to +13 pts |
| Essential infrastructure proximity | +7 pts |

Bands: `Low < 40 · Medium 40–61 · High 62–79 · Urgent 80+`. Every score ships with its reasoning list.

---

## 4. Project structure

```
pulseward-ai/
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout, MapView, CityScene, charts, UI kit, AssistantPanel
│   │   ├── pages/           # Landing, Dashboard, Scanner, Composer, CityMap,
│   │   │                    # Tracking, TrackingDetail, Priority, Admin, Assistant, SignIn
│   │   ├── store/           # AppStore (reports/auth/language/draft/toasts)
│   │   ├── hooks/           # reduced-motion, document title
│   │   ├── lib/             # api, demoAI, demoData, priority, categories, i18n, format
│   │   ├── types.ts
│   │   ├── App.tsx / main.tsx / index.css
│   ├── index.html · package.json · vite.config.ts · tailwind.config.js
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── routes/          # ai.py, reports.py, health.py
│   │   ├── services/        # gemini.py, priority.py
│   │   ├── models/schemas.py
│   │   ├── core/config.py
│   │   ├── store.py         # in-memory demo repository
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── supabase/schema.sql
├── docs/HACKATHON.md        # demo script, judge Q&A, roadmap
└── README.md
```

---

## 5. Run it

### Prerequisites
Node 18+ (tested on Node 26), npm, Python 3.11+ (backend only).

### Frontend (works with no keys)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Production build:

```bash
npm run build && npm run preview
```

Optional config (`frontend/.env.local`):

```bash
VITE_API_URL=http://localhost:8000   # enables real AI via the backend
```

### Backend (optional, enables Gemini)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # then add GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs
```

Check it: `curl http://localhost:8000/api/health` → `{"status":"ok","ai_configured":true|false,...}`.

---

## 6. API setup (Gemini)

1. Create a key at **Google AI Studio** → *Get API key* (free tier is fine for a demo).
2. Put it in `backend/.env`:

   ```bash
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```

3. Restart uvicorn.
4. Set `VITE_API_URL=http://localhost:8000` in `frontend/.env.local` and restart Vite.

**Never** put the key in a `VITE_` variable, in git, or in the browser. `.env` files are untracked by convention —
add them to `.gitignore` if you fork this.

### Behaviour without a key
- `POST /api/ai/analyze` → `503` with a clear message.
- `POST /api/ai/chat` → `503`.
- The frontend catches this and uses `lib/demoAI.ts`: image statistics (brightness, contrast, edge density, colour mix)
  plus filename hints, producing a **clearly labelled** demo estimate, and a bilingual rule-based assistant.
- A toast explains which engine was used. The Scanner badge shows `Demo analyzer` vs `Gemini backend`.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | status + whether AI is configured |
| POST | `/api/ai/analyze` | `{image_base64, mime_type, filename}` → validated analysis |
| POST | `/api/ai/chat` | `{message, language, history, context}` → reply |
| GET | `/api/reports` | demo in-memory reports |
| POST | `/api/reports` | create a report |
| PATCH | `/api/reports/{id}/status` | update workflow status |
| POST | `/api/priority/score` | explainable priority for arbitrary inputs |
| GET | `/docs` | OpenAPI UI |

---

## 7. Supabase setup (production path)

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Enable an auth provider (email/OAuth) in **Authentication → Providers**.
4. The schema auto-creates a `profiles` row per new user, seeds six departments, and creates the
   `report-images` storage bucket with owner-scoped uploads.
5. Promote yourself in SQL:

   ```sql
   update public.profiles set role = 'admin' where id = '<your-uuid>';
   ```

6. Add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to the frontend and replace the demo auth in
   `store/AppStore.tsx` with `supabase.auth`. Point the FastAPI report routes at Supabase using the
   service-role key **server-side only**.

### RLS summary
- `profiles`: read own or admin; update own (cannot self-promote); insert own.
- `reports`: authenticated users read all civic reports; insert only as yourself and only with status
  `Submitted`; citizens can edit only their own still-pending reports; admins can update/delete anything.
- `report_status_events`: readable by authenticated users, writable by admins; status changes logged by trigger.
- `departments`: public read, admin write.
- Storage: public read, authenticated uploads only inside a folder named with your `auth.uid()`.

---

## 8. Demo mode & accounts

Open `/signin` (or the cards on the mobile nav) and pick:

| Account | Role | Can do |
|---|---|---|
| **Aarav Raj** | citizen | scan, report, track, chat |
| **Priya Menon** | admin | everything + Command Center |

No password is required; the role is stored locally. Admin routes are gated in the UI (`AdminGate`) — a mirror of the
RLS policy, not a substitute for it.

- **Reset the demo:** Admin → *Reset demo data* (restores the 14 sample reports).
- **Sample data:** reports tagged `Sample data` are fictional Chennai examples. Your submissions are tagged
  `Your report` / `Citizen submission`.
- **Clearing state:** DevTools → Application → Local Storage → delete keys starting with `pulseward.`

---

## 9. Testing checklist

Frontend (no credentials needed):

- [x] `npm run build` passes (TypeScript + Vite bundle).
- [ ] Landing: hero renders, counters animate, anchors scroll, CTAs navigate.
- [ ] Sign in as citizen → dashboard KPI numbers match the dataset.
- [ ] Scanner: upload JPG/PNG, preview appears, `Analyze` runs, results show category/severity/priority/confidence.
- [ ] Scanner rejects a >6 MB file and a non-image with a toast.
- [ ] Generate smart report → title/category/priority prefilled; validation blocks empty title, short description,
      and a missing location.
- [ ] Pick a location on the map; submit → redirected to the report page with a `Submitted` timeline.
- [ ] `Save draft` survives a page reload (Composer reopens with the draft).
- [ ] `Cancel` shows the discard confirmation modal.
- [ ] Map: category/status/priority filters, search, marker click → popup → report page, clustering at low zoom.
- [ ] Tracking: search + filters + pagination; timeline shows the correct current stage.
- [ ] Priority AI: simulator recalculates live; changing severity/description changes the score and reasons.
- [ ] Admin (sign in as Priya): filters, open modal, change status → timeline updates, assign department, hotspots,
      recurring issues, reset dataset.
- [ ] Visiting `/app/admin` as a citizen shows the access gate.
- [ ] Assistant: suggested question returns an answer; Tamil question gets a Tamil reply; clear chat works.
- [ ] Mobile 390px: nav drawer, stacked cards, map height, form usability.
- [ ] OS "reduce motion" → no 3D spinning, no reveals (static fallbacks).

Backend (with a key):

- [x] `python -m compileall app` passes.
- [ ] `/api/health` reports `ai_configured: true`.
- [ ] `/api/ai/analyze` with a real pothole photo → valid JSON matching the schema.
- [ ] Invalid base64 → 400; > limit → 413; non-image bytes → 415.
- [ ] Without a key both AI endpoints return 503 and the UI falls back cleanly.

Known limitations: demo auth only, in-memory backend reports (no persistence across restarts), no rate limiting
(see roadmap), map tiles need internet, and the 3D chunk is ~220 kB gzipped (lazy-loaded, skipped for reduced motion).

---

## 10. Future improvements

1. **Supabase wiring end-to-end** — replace `AppStore` persistence with real tables + Realtime subscriptions so
   multiple citizens see status changes live.
2. **Rate limiting & abuse control** on the AI endpoints (per-IP + per-user quotas, image hashing to dedupe).
3. **Duplicates & clustering intelligence** — embed report text/images, auto-merge near-identical reports, and show
   "12 citizens reported this" instead of 12 tickets.
4. **SLA & routing model** — department capacity, promised resolution windows, escalation timers.
5. **Offline-first PWA** — queue reports taken with no signal in low-connectivity neighbourhoods, sync later.
6. **Multilingual expansion** — Hindi, Telugu, Malayalam, Kannada, with voice input for low-literacy users.
7. **Open data & accountability** — public ward-level dashboards, before/after photo verification of resolutions.
8. **Accessibility** — screen-reader-verified flows, larger tap targets, high-contrast theme, keyboard-only map controls.
9. **Field verification** — geofence checks, EXIF plausibility, and inspector sign-off before "Resolved".
10. **Model improvements** — fine-tune on municipal imagery, calibrate confidence against human labels.

---

## 11. Notes for judges

- Everything on screen is live: the map, filters, submission flow, admin workflow, charts and assistant.
- The AI pipeline is real when configured, and honest when not: no fake "97% confidence" theatre.
- The priority engine is deliberately explainable — judges can audit the arithmetic in two files.
- PulseWard is not a complaint inbox. It is a shared, prioritised picture of what a city needs next.

Demo script, architecture pitch and Q&A are in [`docs/HACKATHON.md`](docs/HACKATHON.md).
