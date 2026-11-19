import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BrainCircuit,
  Calendar,
  Check,
  Copy,
  MapPin,
  Share2,
  Sparkles,
  Tag,
  User,
} from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useDocumentTitle } from '../hooks/usePrefersReducedMotion';
import {
  Button,
  CategoryBadge,
  EmptyState,
  Panel,
  PriorityBadge,
  ProgressBar,
  SampleTag,
  StatusBadge,
} from '../components/ui';
import { ReportTimeline } from '../components/ReportTimeline';
import { MapView } from '../components/MapView';
import { CATEGORY_MAP } from '../lib/categories';
import { formatCoords, formatDate, shortId } from '../lib/format';
import { PRIORITY_DISCLAIMER } from '../lib/priority';

export function TrackingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { reports, pushToast } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => reports.find((r) => r.id === id), [reports, id]);
  useDocumentTitle(report ? `Report #${shortId(report.id)}` : 'Report not found');

  if (!report) {
    return (
      <EmptyState
        icon={<MapPin className="h-6 w-6" />}
        title="Report not found"
        description="This report does not exist in the current demo dataset. It may have been created in another browser session."
        action={<Button onClick={() => navigate('/app/tracking')}>Back to tracking</Button>}
      />
    );
  }

  const meta = CATEGORY_MAP[report.category];

  async function copyId() {
    try {
      await navigator.clipboard.writeText(report!.id);
      setCopied(true);
      pushToast({ tone: 'success', title: 'Report ID copied' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      pushToast({ tone: 'error', title: 'Could not copy', description: `Report ID: ${report!.id}` });
    }
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: report!.title, text: 'PulseWard AI demo report', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      pushToast({ tone: 'success', title: 'Link copied', description: 'Share this demo report link.' });
    } catch {
      pushToast({ tone: 'info', title: 'Link', description: url });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/app/tracking')}
          className="flex items-center gap-1.5 text-[12px] text-ink-400 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All reports
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} onClick={copyId}>
            {copied ? 'Copied' : 'Copy ID'}
          </Button>
          <Button variant="secondary" size="sm" icon={<Share2 className="h-3.5 w-3.5" />} onClick={share}>
            Share
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel className="!p-0 overflow-hidden">
            {report.image_url ? (
              <img src={report.image_url} alt={report.title} className="max-h-[320px] w-full object-cover" />
            ) : (
              <div
                className="flex h-36 items-center justify-center"
                style={{ background: `linear-gradient(120deg, ${meta.color}22, transparent 65%)` }}
              >
                <div className="text-center">
                  <div
                    className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border"
                    style={{ borderColor: `${meta.color}44`, background: `${meta.color}18` }}
                  >
                    <Tag className="h-5 w-5" style={{ color: meta.color }} />
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-ink-500">
                    No photo attached to this {report.is_sample ? 'sample report' : 'report'}
                  </p>
                </div>
              </div>
            )}

            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-ink-500">#{shortId(report.id)}</span>
                {report.is_sample ? <SampleTag /> : <span className="chip border-pulse-cyan/25 text-pulse-cyan">Citizen submission</span>}
                <StatusBadge status={report.status} />
                <PriorityBadge priority={report.priority} />
              </div>
              <h1 className="mt-2 font-display text-2xl font-semibold leading-snug tracking-tight text-white">
                {report.title}
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-300">{report.description}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 text-ink-500" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-ink-600">Location</p>
                    <p className="text-[12px] text-ink-200">{report.area}</p>
                    <p className="font-mono text-[10px] text-ink-500">{formatCoords(report.latitude, report.longitude)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-3.5 w-3.5 text-ink-500" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-ink-600">Submitted</p>
                    <p className="text-[12px] text-ink-200">{formatDate(report.created_at, true)}</p>
                    <p className="text-[10px] text-ink-500">Updated {formatDate(report.updated_at, true)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-3.5 w-3.5 text-ink-500" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-ink-600">Reported by</p>
                    <p className="text-[12px] text-ink-200">{report.author_name}</p>
                    <p className="text-[10px] text-ink-500">{report.is_sample ? 'Fictional demo resident' : 'Demo session user'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Tag className="mt-0.5 h-3.5 w-3.5 text-ink-500" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-ink-600">Assigned department</p>
                    <p className="text-[12px] text-ink-200">{report.department ?? 'Not assigned'}</p>
                    <p className="text-[10px] text-ink-500">Demo assignment only</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <CategoryBadge category={report.category} />
                <span className="chip">{meta.department}</span>
              </div>
            </div>
          </Panel>

          {report.ai_analysis && (
            <Panel>
              <div className="flex items-center justify-between">
                <p className="panel-title flex items-center gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5 text-pulse-sky" /> AI analysis attached
                </p>
                <span className="text-[9px] uppercase tracking-wider text-ink-500">
                  {report.ai_analysis.source.engine === 'gemini' ? report.ai_analysis.source.model ?? 'Gemini' : 'Demo analyzer'}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CategoryBadge category={report.ai_analysis.category} />
                <PriorityBadge priority={report.ai_analysis.suggestedPriority} />
                <span className="chip">Severity: {report.ai_analysis.severity}</span>
                {report.ai_analysis.confidence != null && (
                  <span className="chip">
                    Confidence: {Math.round(report.ai_analysis.confidence * 100)}%
                  </span>
                )}
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink-300">{report.ai_analysis.description}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">Visible evidence</p>
                  <ul className="mt-1.5 space-y-1">
                    {report.ai_analysis.evidence.map((e, i) => (
                      <li key={i} className="flex gap-1.5 text-[10.5px] leading-relaxed text-ink-400">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pulse-sky" /> {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-pulse-sky/15 bg-pulse-sky/[0.04] p-3">
                  <p className="text-[9px] uppercase tracking-wider text-pulse-sky/80">Recommended action</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-ink-200">{report.ai_analysis.recommendedAction}</p>
                </div>
              </div>
              <p className="mt-2.5 text-[10px] leading-relaxed text-ink-500">{report.ai_analysis.disclaimer}</p>
            </Panel>
          )}

          <Panel>
            <div className="flex items-center justify-between">
              <p className="panel-title flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Location on map
              </p>
              <Link to="/app/map" className="text-[11px] text-pulse-sky hover:underline">Open city map →</Link>
            </div>
            <div className="mt-3">
              <MapView reports={[report]} height="260px" showLegend={false} />
            </div>
          </Panel>
        </div>

        {/* right column */}
        <div className="space-y-4">
          <Panel>
            <p className="panel-title">Status timeline</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-ink-500">
              Demo workflow · updated by an administrator in this browser.
            </p>
            <div className="mt-4">
              <ReportTimeline report={report} />
            </div>
          </Panel>

          <Panel>
            <p className="panel-title flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-pulse-violet" /> Priority estimate
            </p>
            <div className="mt-3 flex items-end justify-between">
              <p className="font-display text-4xl font-semibold text-white">
                {report.priority_score}
                <span className="text-sm text-ink-500">/100</span>
              </p>
              <PriorityBadge priority={report.priority} />
            </div>
            <div className="mt-3">
              <ProgressBar value={report.priority_score} tone={report.priority_score >= 80 ? 'amber' : 'cyan'} />
            </div>
            <ul className="mt-3 space-y-1.5">
              {report.priority_reasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-[10.5px] leading-relaxed text-ink-500">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pulse-violet" /> {r}
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-[9.5px] leading-relaxed text-ink-600">{PRIORITY_DISCLAIMER}</p>
          </Panel>

          <Panel className="border-white/[0.06] bg-white/[0.02]">
            <p className="text-[11px] font-medium text-ink-200">Disclaimer</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-ink-500">
              This report exists only in the PulseWard demo environment. It has not been sent to any government
              department, and this status is not evidence of real-world action or resolution.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
