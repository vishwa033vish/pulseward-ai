import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ImagePlus,
  Info,
  RefreshCcw,
  ScanLine,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useDocumentTitle } from '../hooks/usePrefersReducedMotion';
import { Button, CategoryBadge, Panel, PriorityBadge, ProgressBar, SampleTag, SectionHeading, Spinner, StatusBadge } from '../components/ui';
import { analyzeImage, API_URL, compressImage, readAsDataUrl, validateImageFile, type AnalyzeResult } from '../lib/api';
import { CATEGORY_MAP } from '../lib/categories';
import { scorePriority } from '../lib/priority';
import type { AiAnalysis, Draft } from '../types';

interface Preview {
  dataUrl: string;
  name: string;
  size: number;
  file: File;
}

export function ScannerPage() {
  useDocumentTitle('AI Problem Scanner');
  const navigate = useNavigate();
  const { reports, saveDraft, pushToast, language } = useApp();

  const [preview, setPreview] = useState<Preview | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const validation = validateImageFile(file);
      if (validation) {
        setError(validation);
        pushToast({ tone: 'error', title: 'Image rejected', description: validation });
        return;
      }
      setError(null);
      setResult(null);
      try {
        const compressed = await compressImage(file);
        setPreview({ dataUrl: compressed, name: file.name, size: file.size, file });
      } catch {
        setError('That image could not be read. Try a JPG or PNG photo.');
      }
    },
    [pushToast],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  async function analyze() {
    if (!preview || analyzing) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeImage(preview.file, preview.dataUrl);
      setResult(res);
      if (res.backendError) {
        pushToast({
          tone: 'info',
          title: 'Using the local demo analyzer',
          description: 'The Gemini backend was unreachable, so the clearly-labelled demo estimate was used.',
        });
      }
    } catch {
      setError('AI analysis failed. You can still create a report manually.');
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function createReport() {
    if (!result || !preview) return;
    const a = result.analysis;
    const nearby = reports.filter((r) => r.category === a.category).length;
    const assessment = scorePriority({
      category: a.category,
      severity: a.severity,
      description: a.description,
      nearbyReports: Math.min(nearby, 4),
    });
    const draft: Draft = {
      imageDataUrl: preview.dataUrl,
      analysis: a,
      title: suggestedTitle(a, preview.name),
      description: a.description,
      category: a.category,
      priority: assessment.priority,
      latitude: null,
      longitude: null,
      area: '',
    };
    saveDraft(draft);
    navigate('/app/report/new');
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Step 1 · capture"
        title="AI Problem Scanner"
        description="Upload a photo of a civic problem. The vision model suggests a category, visible evidence, severity and a recommended action. Everything is an estimate you can correct in the next step."
        action={
          <div className="flex items-center gap-2">
            <SampleTag />
            <span className="chip">
              <BrainCircuit className="h-3 w-3 text-pulse-sky" />
              {API_URL ? 'Gemini backend' : 'Demo analyzer'}
            </span>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
        {/* Upload + preview */}
        <Panel className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <p className="panel-title">Source image</p>
            {preview && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-[11px] text-ink-400 transition hover:text-rose-300"
              >
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            )}
          </div>

          {!preview ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`relative flex min-h-[340px] flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                dragging
                  ? 'border-pulse-cyan/70 bg-pulse-cyan/[0.06]'
                  : 'border-white/[0.12] bg-white/[0.015] hover:border-pulse-sky/40 hover:bg-white/[0.03]'
              }`}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
              }}
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 animate-ping rounded-2xl bg-pulse-sky/10" />
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-pulse-sky/30 bg-midnight-900 text-pulse-sky">
                  <ImagePlus className="h-6 w-6" />
                </span>
              </div>
              <p className="font-display text-[15px] font-semibold text-white">
                Drop a photo here, or click to browse
              </p>
              <p className="mt-1.5 max-w-xs text-[12px] leading-relaxed text-ink-400">
                JPG, PNG or WebP · up to 6 MB. Photos are downscaled in your browser before analysis.
              </p>
              <span className="mt-4 chip">
                <Camera className="h-3 w-3" /> Pothole · garbage · leak · light · drain
              </span>
              <p className="mt-5 flex items-center gap-1.5 text-[10px] text-ink-600">
                <Info className="h-3 w-3" /> No photo? Start a manual report from the map instead.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-midnight-950">
                <img
                  src={preview.dataUrl}
                  alt={`Preview of ${preview.name}`}
                  className="max-h-[380px] w-full object-contain"
                />
                {analyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-midnight-950/80 backdrop-blur-[2px]">
                    <div className="relative h-16 w-16">
                      <span className="absolute inset-0 animate-ping rounded-full border border-pulse-cyan/50" />
                      <span className="absolute inset-2 animate-pulse rounded-full border border-pulse-violet/50" />
                      <span className="absolute inset-[22px] rounded-full bg-pulse-cyan" />
                    </div>
                    <p className="font-display text-[13px] font-medium text-white">Scanning civic features…</p>
                    <p className="text-[11px] text-ink-400">Surface · context · severity signals</p>
                  </div>
                )}
                <div className="absolute left-2 top-2 rounded-md bg-midnight-950/80 px-2 py-1 text-[10px] text-ink-300 backdrop-blur">
                  {preview.name.slice(0, 34)} · {(preview.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={analyze} loading={analyzing} icon={!analyzing && <ScanLine className="h-4 w-4" />}>
                  {result ? 'Re-analyze image' : 'Analyze with AI'}
                </Button>
                <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={analyzing}>
                  Replace image
                </Button>
              </div>
              <p className="mt-3 text-[10.5px] leading-relaxed text-ink-500">
                {API_URL
                  ? 'The image is sent to your FastAPI backend, which calls Gemini with your server-side key.'
                  : 'Demo mode: analysis runs locally from image statistics in this browser. No image leaves your device.'}
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 p-3 text-[12px] text-rose-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
        </Panel>

        {/* Results */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!result && !analyzing && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Panel className="flex min-h-[280px] flex-col items-center justify-center text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-ink-400">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-display text-sm font-semibold text-ink-200">Analysis results appear here</p>
                  <p className="mt-1 max-w-xs text-[12px] leading-relaxed text-ink-500">
                    You'll get a problem category, visible evidence, severity, a suggested priority and a recommended
                    action — with an explicit confidence estimate.
                  </p>
                  <div className="mt-5 grid w-full max-w-sm grid-cols-3 gap-2 text-left">
                    {['Category', 'Severity', 'Priority'].map((s) => (
                      <div key={s} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                        <p className="text-[9px] uppercase tracking-wider text-ink-600">{s}</p>
                        <div className="mt-1.5 h-1.5 w-8 rounded-full bg-white/[0.08]" />
                      </div>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}

            {analyzing && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Panel className="min-h-[280px]">
                  <p className="panel-title">Analyzing</p>
                  <div className="mt-4 space-y-3">
                    {['Reading image pixels', 'Classifying civic category', 'Estimating visible severity', 'Preparing recommendation'].map(
                      (label, i) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="grid h-5 w-5 place-items-center rounded-full border border-pulse-sky/30 bg-pulse-sky/10 text-[9px] text-pulse-sky">
                            {i + 1}
                          </span>
                          <span className="flex-1 text-[12px] text-ink-300">{label}</span>
                          <motion.span
                            className="h-1 w-10 rounded-full bg-pulse-sky/30"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        </div>
                      ),
                    )}
                  </div>
                  <div className="mt-5">
                    <ProgressBar value={72} />
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-[10px] text-ink-500">
                    <Spinner /> Working locally — this stays responsive.
                  </p>
                </Panel>
              </motion.div>
            )}

            {result && !analyzing && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <AnalysisCard
                  analysis={result.analysis}
                  engine={result.engine}
                  backendError={result.backendError}
                  language={language}
                />

                <Panel>
                  <p className="panel-title">Next step</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink-400">
                    The Smart Report Generator will prefill a report with this analysis. You can edit every field and pick
                    the exact location on the map before submitting.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={createReport} icon={<Wand2 className="h-4 w-4" />}>
                      Generate smart report
                    </Button>
                    <Button variant="secondary" onClick={analyze} icon={<RefreshCcw className="h-3.5 w-3.5" />}>
                      Re-analyze
                    </Button>
                  </div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Panel className="border-pulse-sky/15 bg-pulse-sky/[0.03]">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-pulse-sky" />
          <div className="text-[11.5px] leading-relaxed text-ink-400">
            <p className="font-medium text-ink-200">How to read AI output</p>
            <p className="mt-1">
              The model describes what may be visible in the frame. It cannot confirm structural condition, cause or
              danger. Confidence is a model-reported signal, not a guarantee. Always verify the category and location
              before submitting, and let a human inspector make the final call.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function suggestedTitle(a: AiAnalysis, filename: string): string {
  const meta = CATEGORY_MAP[a.category];
  const base = meta.label;
  const hint = filename.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim();
  const cleanHint = hint && hint.length > 3 && !/^(img|image|photo|screenshot|whatsapp)/i.test(hint) ? ` near ${hint}` : '';
  return `${base} reported${cleanHint}`;
}

function AnalysisCard({
  analysis,
  engine,
  backendError,
  language,
}: {
  analysis: AiAnalysis;
  engine: 'gemini' | 'demo';
  backendError?: string;
  language: 'en' | 'ta';
}) {
  const meta = CATEGORY_MAP[analysis.category];
  const confidencePct = analysis.confidence != null ? Math.round(analysis.confidence * 100) : null;
  return (
    <motion.div layout className="glass overflow-hidden">
      <div
        className="border-b border-white/[0.07] px-5 py-4"
        style={{ background: `linear-gradient(110deg, ${meta.color}12, transparent 70%)` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Analysis complete
            </p>
            <h3 className="mt-1.5 font-display text-lg font-semibold text-white">{meta.label}</h3>
            <p className="text-[11px] text-ink-500">
              {language === 'ta' ? meta.labelTa : meta.description}
            </p>
          </div>
          <span className="rounded-lg border border-white/10 bg-midnight-950/50 px-2 py-1 text-[9px] uppercase tracking-wider text-ink-400">
            {engine === 'gemini' ? 'Gemini' : 'Demo AI'}
          </span>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div>
          <p className="label">Visible observation</p>
          <p className="text-[13px] leading-relaxed text-ink-200">{analysis.description}</p>
        </div>

        <div>
          <p className="label">Evidence considered</p>
          <ul className="space-y-1.5">
            {analysis.evidence.map((e, i) => (
              <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-ink-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pulse-sky" />
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-ink-500">Severity</p>
            <p className="mt-1 text-[12px] font-medium text-ink-100">{analysis.severity}</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-ink-500">Suggested priority</p>
            <div className="mt-1">
              <PriorityBadge priority={analysis.suggestedPriority} />
            </div>
          </div>
          <div className="col-span-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 sm:col-span-1">
            <p className="text-[9px] uppercase tracking-wider text-ink-500">Confidence</p>
            <p className="mt-1 text-[12px] font-medium text-ink-100">
              {confidencePct != null ? `${confidencePct}%` : 'Not reported'}
            </p>
            {confidencePct != null && (
              <div className="mt-1.5">
                <ProgressBar value={confidencePct} tone={confidencePct > 70 ? 'cyan' : 'amber'} />
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="label">Recommended action</p>
          <p className="rounded-xl border border-pulse-sky/20 bg-pulse-sky/[0.05] p-3 text-[12px] leading-relaxed text-ink-200">
            {analysis.recommendedAction}
          </p>
        </div>

        {backendError && (
          <p className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-2.5 text-[10.5px] leading-relaxed text-amber-200/90">
            Backend unavailable ({backendError.slice(0, 90)}). Showing the local demo estimate instead.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={analysis.category} />
          <StatusBadge status="Submitted" />
          {analysis.isEstimate && (
            <span className="chip border-amber-300/20 text-amber-200/80">AI estimate</span>
          )}
        </div>

        <p className="text-[10px] leading-relaxed text-ink-500">{analysis.disclaimer}</p>
      </div>
    </motion.div>
  );
}
