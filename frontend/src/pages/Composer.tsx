import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Info,
  MapPin,
  Save,
  ScanLine,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useDocumentTitle } from '../hooks/usePrefersReducedMotion';
import {
  Button,
  CategoryBadge,
  EmptyState,
  Modal,
  Panel,
  PriorityBadge,
  ProgressBar,
  SectionHeading,
} from '../components/ui';
import { LocationPicker } from '../components/MapView';
import { CATEGORIES, CATEGORY_MAP } from '../lib/categories';
import { scorePriority, PRIORITY_DISCLAIMER } from '../lib/priority';
import { countNearbyReports } from '../lib/priority';
import { compressImage, validateImageFile } from '../lib/api';
import type { Category, Draft, Priority, Report, StatusEvent } from '../types';
import { formatCoords } from '../lib/format';

const EMPTY_DRAFT: Draft = {
  imageDataUrl: null,
  analysis: null,
  title: '',
  description: '',
  category: 'road_damage',
  priority: 'Medium',
  latitude: null,
  longitude: null,
  area: '',
};

export function ComposerPage() {
  useDocumentTitle('Smart Report Generator');
  const navigate = useNavigate();
  const { draft, saveDraft, addReport, pushToast, profile, reports, language } = useApp();
  const [form, setForm] = useState<Draft>(draft ?? EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasDraft = Boolean(draft);

  useEffect(() => {
    if (draft) setForm(draft);
  }, [draft]);

  const nearby = useMemo(() => {
    if (form.latitude == null || form.longitude == null) {
      return reports.filter((r) => r.category === form.category).length;
    }
    return countNearbyReports(
      { latitude: form.latitude, longitude: form.longitude, category: form.category },
      reports,
    );
  }, [form.latitude, form.longitude, form.category, reports]);

  const assessment = useMemo(
    () =>
      scorePriority({
        category: form.category,
        severity: form.analysis?.severity,
        description: `${form.title} ${form.description}`,
        nearbyReports: nearby,
      }),
    [form.category, form.analysis, form.title, form.description, nearby],
  );

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim() || form.title.trim().length < 6) next.title = 'Give the report a clear title (min 6 characters).';
    if (!form.description.trim() || form.description.trim().length < 20)
      next.description = 'Describe what you can see (min 20 characters).';
    if (form.latitude == null || form.longitude == null) next.location = 'Pick the exact location on the map.';
    if (!form.area.trim()) next.area = 'Add an area or landmark name.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function attachImage(file: File) {
    const err = validateImageFile(file);
    if (err) {
      pushToast({ tone: 'error', title: 'Image rejected', description: err });
      return;
    }
    setImageBusy(true);
    try {
      const dataUrl = await compressImage(file);
      update('imageDataUrl', dataUrl);
      pushToast({ tone: 'success', title: 'Image attached', description: 'Attached to this report draft.' });
    } finally {
      setImageBusy(false);
    }
  }

  function saveAsDraft() {
    saveDraft({ ...form, savedAt: new Date().toISOString() });
    pushToast({ tone: 'success', title: 'Draft saved', description: 'Stored in this browser — continue any time.' });
  }

  function submit() {
    if (!validate() || form.latitude == null || form.longitude == null) {
      pushToast({ tone: 'error', title: 'Check the form', description: 'A few required fields need attention.' });
      return;
    }
    setSubmitting(true);
    const now = new Date().toISOString();
    const history: StatusEvent[] = [
      { status: 'Submitted', at: now, note: 'Submitted in the PulseWard demo environment' },
    ];
    const report: Report = {
      id: `cp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: profile?.id ?? 'demo-guest',
      author_name: profile?.display_name ?? 'Demo guest',
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      priority_score: assessment.score,
      priority_reasons: assessment.reasons,
      status: 'Submitted',
      latitude: form.latitude,
      longitude: form.longitude,
      area: form.area.trim(),
      image_url: form.imageDataUrl,
      ai_analysis: form.analysis,
      department: null,
      is_sample: false,
      created_at: now,
      updated_at: now,
      status_history: history,
    };
    addReport(report);
    saveDraft(null);
    pushToast({
      tone: 'success',
      title: 'Report created (demo)',
      description: 'Saved in this browser only. No government department was contacted.',
    });
    setTimeout(() => {
      setSubmitting(false);
      navigate(`/app/tracking/${report.id}`);
    }, 500);
  }

  if (!hasDraft && !form.title && !form.description && !form.imageDataUrl) {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Step 2 · structure"
          title="Smart Report Generator"
          description="Reports are drafted from AI analysis. Start with a scan, or create a blank report if you already know what to file."
        />
        <EmptyState
          icon={<ScanLine className="h-6 w-6" />}
          title="No analysis draft yet"
          description="Scan a photo first and we'll prefill the category, description, priority estimate and recommended action."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => navigate('/app/scan')} icon={<ScanLine className="h-4 w-4" />}>
                Open AI Scanner
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  saveDraft({ ...EMPTY_DRAFT });
                  setForm({ ...EMPTY_DRAFT });
                  pushToast({ tone: 'info', title: 'Blank report started' });
                }}
              >
                Start a blank report
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Step 2 · structure"
        title="Smart Report Generator"
        description="Edit anything before submitting. AI suggestions are estimates — correct them where your own eyes disagree."
        action={
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={() => navigate('/app/scan')}>
            Back to scanner
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* FORM */}
        <div className="space-y-4">
          <Panel>
            <p className="panel-title">Report details</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="title">Report title *</label>
                <input
                  id="title"
                  className="field"
                  value={form.title}
                  placeholder="e.g. Large pothole near the school bus stop"
                  onChange={(e) => update('title', e.target.value)}
                  maxLength={110}
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.title ? <p className="text-[11px] text-rose-300">{errors.title}</p> : <span />}
                  <span className="text-[10px] text-ink-600">{form.title.length}/110</span>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  className="field min-h-[120px] resize-y"
                  value={form.description}
                  placeholder="What is the problem, how long has it been there, and who does it affect?"
                  onChange={(e) => update('description', e.target.value)}
                  maxLength={800}
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.description ? (
                    <p className="text-[11px] text-rose-300">{errors.description}</p>
                  ) : (
                    <span className="text-[10px] text-ink-600">Tamil or English is fine.</span>
                  )}
                  <span className="text-[10px] text-ink-600">{form.description.length}/800</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="category">Category</label>
                  <select
                    id="category"
                    className="field"
                    value={form.category}
                    onChange={(e) => update('category', e.target.value as Category)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-midnight-900">
                        {language === 'ta' ? c.labelTa : c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="priority">Priority (your call)</label>
                  <select
                    id="priority"
                    className="field"
                    value={form.priority}
                    onChange={(e) => update('priority', e.target.value as Priority)}
                  >
                    {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((p) => (
                      <option key={p} value={p} className="bg-midnight-900">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <p className="panel-title">Location</p>
              <button
                onClick={() => {
                  if (!navigator.geolocation) {
                    pushToast({ tone: 'error', title: 'Geolocation unavailable in this browser' });
                    return;
                  }
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      update('latitude', pos.coords.latitude);
                      update('longitude', pos.coords.longitude);
                      pushToast({ tone: 'success', title: 'Location captured' });
                    },
                    () =>
                      pushToast({
                        tone: 'error',
                        title: 'Location permission denied',
                        description: 'No problem — click the map to set the spot manually.',
                      }),
                    { enableHighAccuracy: true, timeout: 8000 },
                  );
                }}
                className="chip transition hover:border-pulse-sky/40 hover:text-white"
              >
                <MapPin className="h-3 w-3" /> Use my location
              </button>
            </div>

            <div className="mt-3">
              <label className="label" htmlFor="area">Area / landmark *</label>
              <input
                id="area"
                className="field"
                value={form.area}
                placeholder="e.g. Anna Salai, near Teynampet bus stop"
                onChange={(e) => update('area', e.target.value)}
              />
              {errors.area && <p className="mt-1 text-[11px] text-rose-300">{errors.area}</p>}
            </div>

            <div className="mt-3">
              <LocationPicker
                value={
                  form.latitude != null && form.longitude != null
                    ? { lat: form.latitude, lng: form.longitude }
                    : null
                }
                onChange={(next) => {
                  update('latitude', next.lat);
                  update('longitude', next.lng);
                }}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-ink-500">
                  {form.latitude != null && form.longitude != null ? (
                    <span className="font-mono text-ink-300">{formatCoords(form.latitude, form.longitude)}</span>
                  ) : (
                    'No coordinates selected yet'
                  )}
                </span>
                {form.latitude != null && (
                  <button
                    onClick={() => {
                      update('latitude', null);
                      update('longitude', null);
                    }}
                    className="text-ink-500 hover:text-rose-300"
                  >
                    Clear
                  </button>
                )}
              </div>
              {errors.location && <p className="mt-1 text-[11px] text-rose-300">{errors.location}</p>}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <p className="panel-title">Photo</p>
              {form.imageDataUrl && (
                <button
                  onClick={() => update('imageDataUrl', null)}
                  className="flex items-center gap-1 text-[11px] text-ink-400 hover:text-rose-300"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              )}
            </div>
            {form.imageDataUrl ? (
              <img
                src={form.imageDataUrl}
                alt="Report attachment preview"
                className="mt-3 max-h-64 w-full rounded-xl border border-white/10 object-contain"
              />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={imageBusy}
                className="mt-3 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/12 p-6 text-[12px] text-ink-400 transition hover:border-pulse-sky/40 hover:text-ink-200"
              >
                <ScanLine className="h-5 w-5 text-pulse-sky" />
                {imageBusy ? 'Preparing image…' : 'Attach a photo (optional)'}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void attachImage(f);
              }}
            />
          </Panel>

          <div className="flex flex-wrap gap-2">
            <Button onClick={submit} loading={submitting} icon={!submitting && <Send className="h-4 w-4" />}>
              Submit report
            </Button>
            <Button variant="secondary" onClick={saveAsDraft} icon={<Save className="h-4 w-4" />}>
              Save draft
            </Button>
            <Button variant="ghost" onClick={() => setConfirmCancel(true)}>
              Cancel
            </Button>
          </div>
          <p className="text-[10px] leading-relaxed text-ink-600">
            Submitting stores the report in this browser's demo dataset. Nothing is sent to a municipality, and no
            real-world resolution is implied.
          </p>
        </div>

        {/* SIDE: AI + priority */}
        <div className="space-y-4">
          {form.analysis ? (
            <Panel>
              <div className="flex items-center justify-between">
                <p className="panel-title flex items-center gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5 text-pulse-sky" /> AI analysis
                </p>
                <span className="text-[9px] uppercase tracking-wider text-ink-500">
                  {form.analysis.source.engine === 'gemini' ? 'Gemini' : 'Demo AI'}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CategoryBadge category={form.analysis.category} />
                <PriorityBadge priority={form.analysis.suggestedPriority} />
                <span className="chip">Severity: {form.analysis.severity}</span>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-ink-300">{form.analysis.description}</p>
              <ul className="mt-2 space-y-1">
                {form.analysis.evidence.slice(0, 3).map((e, i) => (
                  <li key={i} className="flex gap-2 text-[11px] text-ink-500">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pulse-sky" /> {e}
                  </li>
                ))}
              </ul>
              <div className="mt-3 rounded-xl border border-pulse-sky/20 bg-pulse-sky/[0.05] p-3">
                <p className="text-[9px] uppercase tracking-wider text-pulse-sky/80">Recommended action</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-200">{form.analysis.recommendedAction}</p>
              </div>
              <p className="mt-2.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-ink-500">
                <Info className="mt-0.5 h-3 w-3 shrink-0" /> {form.analysis.disclaimer}
              </p>
            </Panel>
          ) : (
            <Panel className="border-white/[0.06]">
              <p className="panel-title">AI analysis</p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-400">
                This report has no image analysis attached. You can still submit it manually, or run a scan to add a
                structured AI estimate.
              </p>
              <Button
                variant="soft"
                size="sm"
                className="mt-3"
                icon={<ScanLine className="h-3.5 w-3.5" />}
                onClick={() => navigate('/app/scan')}
              >
                Run a scan
              </Button>
            </Panel>
          )}

          <Panel>
            <p className="panel-title flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-pulse-violet" /> Priority intelligence
            </p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="font-display text-3xl font-semibold text-white">
                  {assessment.score}
                  <span className="text-sm text-ink-500">/100</span>
                </p>
                <p className="mt-0.5 text-[11px] text-ink-500">Estimated risk score</p>
              </div>
              <PriorityBadge priority={assessment.priority} />
            </div>
            <div className="mt-3">
              <ProgressBar value={assessment.score} tone={assessment.score >= 80 ? 'amber' : 'cyan'} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                <p className="text-[9px] uppercase tracking-wider text-ink-500">Category weight</p>
                <p className="mt-0.5 text-ink-200">{assessment.factors.categoryWeight}/100</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                <p className="text-[9px] uppercase tracking-wider text-ink-500">Severity weight</p>
                <p className="mt-0.5 text-ink-200">{assessment.factors.severityWeight}/100</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                <p className="text-[9px] uppercase tracking-wider text-ink-500">Similar nearby</p>
                <p className="mt-0.5 text-ink-200">{assessment.factors.nearbyReports}</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                <p className="text-[9px] uppercase tracking-wider text-ink-500">Essential infra</p>
                <p className="mt-0.5 text-ink-200">{assessment.factors.essentialInfrastructure ? 'Likely' : 'Not detected'}</p>
              </div>
            </div>

            <details className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <summary className="cursor-pointer text-[11px] font-medium text-ink-300">
                Why this priority? ({assessment.reasons.length} factors)
              </summary>
              <ul className="mt-2 space-y-1.5">
                {assessment.reasons.map((r, i) => (
                  <li key={i} className="flex gap-2 text-[10.5px] leading-relaxed text-ink-500">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pulse-violet" /> {r}
                  </li>
                ))}
              </ul>
            </details>

            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[10px] leading-relaxed text-ink-600">{PRIORITY_DISCLAIMER}</p>
            </div>
            {assessment.priority !== form.priority && (
              <Button
                variant="soft"
                size="sm"
                className="mt-3 w-full"
                onClick={() => update('priority', assessment.priority)}
              >
                Apply AI suggestion: {assessment.priority}
              </Button>
            )}
          </Panel>

          {form.analysis && form.analysis.category !== form.category && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] p-3 text-[11px] leading-relaxed text-amber-200/90">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              You changed the category from the AI suggestion ({CATEGORY_MAP[form.analysis.category].label}). Your choice
              will be stored with the report.
            </div>
          )}
        </div>
      </div>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Discard this report?"
        description="Your current form entries will be lost. You can save as draft instead."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Keep editing</Button>
            <Button variant="secondary" onClick={() => { saveAsDraft(); setConfirmCancel(false); navigate('/app'); }}>
              Save as draft
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                saveDraft(null);
                setConfirmCancel(false);
                navigate('/app');
              }}
            >
              Discard
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-ink-400">
          Reports are only saved when you submit or explicitly save a draft.
        </p>
      </Modal>

      {form.analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-[10px] text-ink-600"
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Draft created from AI analysis — review before submitting.
        </motion.div>
      )}
    </div>
  );
}
