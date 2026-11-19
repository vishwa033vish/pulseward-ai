import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Flame,
  Layers3,
  MapPin,
  RefreshCcw,
  Search,
  Shield,
  TrendingUp,
  Users,
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
  SampleTag,
  SectionHeading,
  StatusBadge,
} from '../components/ui';
import { CategoryChart, StatusChart, TrendChart } from '../components/charts';
import { MapView } from '../components/MapView';
import { ReportTimeline } from '../components/ReportTimeline';
import { CATEGORIES, CATEGORY_MAP, DEPARTMENTS, STATUSES } from '../lib/categories';
import { formatCoords, formatDate, shortId } from '../lib/format';
import type { Category, Priority, Report, Status } from '../types';

export function AdminPage() {
  useDocumentTitle('Admin Command Center');
  const { reports, profile, updateStatus, assignDepartment, pushToast, resetDemoData } = useApp();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status | 'All'>('All');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [priority, setPriority] = useState<Priority | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [draftStatus, setDraftStatus] = useState<Status>('Submitted');
  const [draftDept, setDraftDept] = useState<string>('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...reports]
      .filter((r) => (status === 'All' ? true : r.status === status))
      .filter((r) => (category === 'All' ? true : r.category === category))
      .filter((r) => (priority === 'All' ? true : r.priority === priority))
      .filter((r) => (q ? `${r.title} ${r.area} ${r.id} ${r.author_name}`.toLowerCase().includes(q) : true))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reports, status, category, priority, query]);

  const selected = reports.find((r) => r.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const open = reports.filter((r) => r.status !== 'Resolved');
    return {
      total: reports.length,
      open: open.length,
      urgent: reports.filter((r) => r.priority === 'Urgent' && r.status !== 'Resolved').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
      unassigned: reports.filter((r) => !r.department && r.status !== 'Resolved').length,
      citizens: new Set(reports.map((r) => r.user_id)).size,
    };
  }, [reports]);

  const hotspots = useMemo(() => {
    const map = new Map<string, { area: string; count: number; urgent: number; cats: Set<string> }>();
    reports.forEach((r) => {
      const key = r.area.split(',')[0].trim();
      const entry = map.get(key) ?? { area: key, count: 0, urgent: 0, cats: new Set<string>() };
      entry.count += 1;
      if (r.priority === 'Urgent' || r.priority === 'High') entry.urgent += 1;
      entry.cats.add(r.category);
      map.set(key, entry);
    });
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [reports]);

  const recurring = useMemo(() => {
    const map = new Map<string, { area: string; category: Category; count: number; ids: string[] }>();
    reports.forEach((r) => {
      const area = r.area.split(',')[0].trim();
      const key = `${area}|${r.category}`;
      const entry = map.get(key) ?? { area, category: r.category, count: 0, ids: [] };
      entry.count += 1;
      entry.ids.push(r.id);
      map.set(key, entry);
    });
    return [...map.values()].filter((e) => e.count > 1).sort((a, b) => b.count - a.count).slice(0, 4);
  }, [reports]);

  function openDetail(report: Report) {
    setSelectedId(report.id);
    setDraftStatus(report.status);
    setDraftDept(report.department ?? '');
    setDetailOpen(true);
  }

  function saveDetail() {
    if (!selected) return;
    if (draftStatus !== selected.status) {
      updateStatus(selected.id, draftStatus, 'Updated from Admin Command Center (demo)');
    }
    const dept = DEPARTMENTS.find((d) => d.department_name === draftDept) ?? null;
    if ((selected.department ?? '') !== draftDept) {
      assignDepartment(selected.id, dept);
    }
    pushToast({
      tone: 'success',
      title: 'Demo record updated',
      description: 'Stored locally — no department was actually notified.',
    });
    setDetailOpen(false);
  }

  function advance(report: Report) {
    const idx = STATUSES.indexOf(report.status);
    const next = STATUSES[Math.min(STATUSES.length - 1, idx + 1)];
    if (next === report.status) {
      pushToast({ tone: 'info', title: 'Already resolved', description: 'Nothing further to advance in the demo workflow.' });
      return;
    }
    updateStatus(report.id, next, 'Advanced from Admin Command Center (demo)');
    pushToast({ tone: 'success', title: `Status → ${next}`, description: `${shortId(report.id)} updated (demo only).` });
  }

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Municipal operations (demo)"
        title="Admin Command Center"
        description="Triage every report, assign demo departments, move statuses and read the city's issue patterns. All actions are simulated in this browser."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip border-pulse-violet/25 text-pulse-violet">
              <Shield className="h-3 w-3" /> {profile?.role === 'admin' ? profile.display_name : 'Admin'}
            </span>
            <Button variant="secondary" size="sm" icon={<RefreshCcw className="h-3.5 w-3.5" />} onClick={() => setConfirmReset(true)}>
              Reset demo data
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'All reports', value: stats.total, icon: Layers3, color: '#38BDF8' },
          { label: 'Open / active', value: stats.open, icon: Activity, color: '#FBBF24' },
          { label: 'Urgent open', value: stats.urgent, icon: Flame, color: '#F87171' },
          { label: 'Resolved (demo)', value: stats.resolved, icon: CheckCircle2, color: '#4ADE80' },
        ].map((s) => (
          <Panel key={s.label} className="!p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ink-500">{s.label}</p>
                <p className="mt-1.5 font-display text-2xl font-semibold text-white">{s.value}</p>
              </div>
              <span
                className="grid h-8 w-8 place-items-center rounded-lg border"
                style={{ background: `${s.color}14`, borderColor: `${s.color}33`, color: s.color }}
              >
                <s.icon className="h-3.5 w-3.5" />
              </span>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="panel-title">Volume trend</p>
            <span className="text-[10px] text-ink-500">Last 14 days</span>
          </div>
          <TrendChart reports={reports} />
        </Panel>
        <Panel>
          <p className="panel-title">Workflow load</p>
          <div className="mt-2">
            <StatusChart reports={reports} />
          </div>
        </Panel>
      </div>

      {/* Filters + table */}
      <Panel className="!p-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
            <input
              className="field !pl-9"
              placeholder="Search all reports…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className="field !w-auto" value={status} onChange={(e) => setStatus(e.target.value as Status | 'All')} aria-label="Status filter">
            <option value="All">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="field !w-auto" value={category} onChange={(e) => setCategory(e.target.value as Category | 'All')} aria-label="Category filter">
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select className="field !w-auto" value={priority} onChange={(e) => setPriority(e.target.value as Priority | 'All')} aria-label="Priority filter">
            <option value="All">All priorities</option>
            {(['Urgent', 'High', 'Medium', 'Low'] as Priority[]).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[10px] text-ink-500">
          <span>{filtered.length} matching reports ({stats.unassigned} unassigned)</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {stats.citizens} demo reporters</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={<Search className="h-5 w-5" />} title="No reports match" description="Try a different search or filter combination." />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-y border-white/[0.06] text-[9.5px] uppercase tracking-[0.14em] text-ink-500">
                    <th className="px-4 py-2.5 font-medium">Report</th>
                    <th className="px-3 py-2.5 font-medium">Category</th>
                    <th className="px-3 py-2.5 font-medium">Priority</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Department</th>
                    <th className="px-3 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="table-row">
                      <td className="max-w-[280px] px-4 py-3">
                        <button onClick={() => openDetail(r)} className="block text-left">
                          <span className="line-clamp-1 text-[12px] text-ink-100 hover:text-white">{r.title}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-ink-500">
                            <span className="font-mono">#{shortId(r.id)}</span>
                            <span>·</span>
                            <MapPin className="h-2.5 w-2.5" />
                            <span className="line-clamp-1">{r.area}</span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3"><CategoryBadge category={r.category} /></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <PriorityBadge priority={r.priority} />
                          <span className="font-mono text-[10px] text-ink-500">{r.priority_score}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-3 text-[11px] text-ink-400">{r.department ?? <span className="text-ink-600">Unassigned</span>}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(r)}>Open</Button>
                          <Button variant="soft" size="sm" onClick={() => advance(r)} disabled={r.status === 'Resolved'}>
                            Advance
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 p-3 md:hidden">
              {filtered.map((r) => (
                <div key={r.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-[12px] font-medium text-ink-100">{r.title}</p>
                    <span className="font-mono text-[9px] text-ink-500">#{shortId(r.id)}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-ink-500">{r.area}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <CategoryBadge category={r.category} />
                    <PriorityBadge priority={r.priority} />
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2.5 flex gap-1.5">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => openDetail(r)}>Open</Button>
                    <Button size="sm" variant="soft" className="flex-1" onClick={() => advance(r)} disabled={r.status === 'Resolved'}>
                      Advance
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>

      {/* Analytics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <p className="panel-title flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-amber-400" /> Hotspots</p>
          <p className="mt-1 text-[10px] text-ink-500">Areas with the highest report concentration</p>
          <div className="mt-3 space-y-2.5">
            {hotspots.map((h, i) => (
              <div key={h.area}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-ink-200">
                    <span className="text-[9px] text-ink-600">0{i + 1}</span> {h.area}
                  </span>
                  <span className="text-ink-500">{h.count} reports</span>
                </div>
                <ProgressBar value={(h.count / Math.max(1, hotspots[0].count)) * 100} tone={i === 0 ? 'amber' : 'cyan'} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <p className="panel-title flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-pulse-sky" /> Recurring issues</p>
          <p className="mt-1 text-[10px] text-ink-500">Same category repeating in one area</p>
          {recurring.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-white/10 p-3 text-[11px] text-ink-500">
              No recurring patterns in the current dataset.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {recurring.map((rec) => (
                <div key={`${rec.area}-${rec.category}`} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-ink-200">{rec.area}</p>
                    <span className="chip">{rec.count}×</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <CategoryBadge category={rec.category} />
                    <Link
                      to={`/app/tracking/${rec.ids[0]}`}
                      className="flex items-center gap-0.5 text-[10px] text-pulse-sky hover:underline"
                    >
                      View <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <p className="panel-title flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-pulse-violet" /> Category load</p>
          <CategoryChart reports={reports} />
        </Panel>
      </div>

      <Panel className="!p-0 overflow-hidden">
        <div className="border-b border-white/[0.06] p-4">
          <p className="panel-title">City analytics map</p>
          <p className="mt-1 text-[10.5px] text-ink-500">
            Report density across the demonstration city. Urgent open reports pulse.
          </p>
        </div>
        <div className="p-3">
          <MapView reports={reports} height="380px" />
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 text-[10px] text-ink-600">
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" /> Admin actions are demo-only. No municipality is integrated in this build.
        </span>
        <SampleTag />
      </div>

      {/* Detail modal */}
      <Modal
        open={detailOpen && Boolean(selected)}
        onClose={() => setDetailOpen(false)}
        title={selected ? selected.title : 'Report'}
        description={selected ? `#${shortId(selected.id)} · ${selected.area} · ${selected.author_name}` : undefined}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetailOpen(false)}>Close</Button>
            <Link to={selected ? `/app/tracking/${selected.id}` : '/app/tracking'}>
              <Button variant="secondary">Full report</Button>
            </Link>
            <Button onClick={saveDetail}>Save demo changes</Button>
          </>
        }
      >
        {selected && (
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3">
              {selected.image_url && (
                <img src={selected.image_url} alt="" className="max-h-52 w-full rounded-xl border border-white/10 object-cover" />
              )}
              <div className="flex flex-wrap gap-1.5">
                <CategoryBadge category={selected.category} />
                <PriorityBadge priority={selected.priority} />
                <StatusBadge status={selected.status} />
                {selected.is_sample && <SampleTag />}
              </div>
              <p className="text-[12px] leading-relaxed text-ink-300">{selected.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div><p className="text-ink-600">Submitted</p><p className="text-ink-300">{formatDate(selected.created_at, true)}</p></div>
                <div><p className="text-ink-600">Coordinates</p><p className="font-mono text-ink-300">{formatCoords(selected.latitude, selected.longitude)}</p></div>
                <div><p className="text-ink-600">Priority score</p><p className="text-ink-300">{selected.priority_score}/100</p></div>
                <div><p className="text-ink-600">Recommended dept.</p><p className="text-ink-300">{CATEGORY_MAP[selected.category].department}</p></div>
              </div>

              {selected.ai_analysis && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">AI analysis (estimate)</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-300">{selected.ai_analysis.description}</p>
                  <p className="mt-1.5 text-[10px] text-ink-500">
                    Severity {selected.ai_analysis.severity}
                    {selected.ai_analysis.confidence != null &&
                      ` · confidence ${Math.round(selected.ai_analysis.confidence * 100)}%`}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <label className="label" htmlFor="admin-status">Update status</label>
                <select id="admin-status" className="field" value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as Status)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className="label mt-3" htmlFor="admin-dept">Assign department</label>
                <select id="admin-dept" className="field" value={draftDept} onChange={(e) => setDraftDept(e.target.value)}>
                  <option value="">Unassigned</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.department_name}>{d.department_name}</option>
                  ))}
                </select>
                <p className="mt-2 text-[10px] leading-relaxed text-ink-600">
                  Saving records a demo status event and local assignment only.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] p-3">
                <p className="label">Timeline</p>
                <ReportTimeline report={selected} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo dataset?"
        description="This replaces all reports in this browser with the original 14 sample reports. Your submitted reports will be removed."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemoData();
                setConfirmReset(false);
              }}
            >
              Reset dataset
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-ink-400">This cannot be undone in this browser session.</p>
      </Modal>
    </div>
  );
}
