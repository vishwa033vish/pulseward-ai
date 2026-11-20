import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Filter, MapPin, Search, X } from 'lucide-react';
import { useApp } from '../store/AppStore';
import { translate } from '../lib/i18n';
import { useDocumentTitle } from '../hooks/usePrefersReducedMotion';
import { Button, CategoryBadge, EmptyState, Panel, PriorityBadge, SampleTag, SectionHeading, StatusBadge } from '../components/ui';
import { CATEGORIES, STATUSES } from '../lib/categories';
import { formatDate, shortId } from '../lib/format';
import type { Category, Status } from '../types';

const PAGE_SIZE = 8;

export function TrackingPage() {
  useDocumentTitle('Track Reports');
  const { reports, language } = useApp();
  const tr = (key: string) => translate(key, language);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status | 'All'>('All');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...reports]
      .filter((r) => (status === 'All' ? true : r.status === status))
      .filter((r) => (category === 'All' ? true : r.category === category))
      .filter((r) =>
        q ? `${r.title} ${r.description} ${r.area} ${r.id}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reports, status, category, query]);

  const shown = filtered.slice(0, visible);
  const myReports = reports.filter((r) => r.user_id === 'demo-citizen');

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow={tr('track.eyebrow')}
        title={tr('track.title')}
        description={tr('track.description')}
        action={<SampleTag />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <Panel className="!p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
                <input
                  className="field !pl-9"
                  placeholder={`${tr('common.search')}…`}
                  aria-label={tr('common.search')}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setVisible(PAGE_SIZE);
                  }}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <select
                className="field !w-auto"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as Status | 'All');
                  setVisible(PAGE_SIZE);
                }}
                aria-label="Filter by status"
              >
                <option value="All">{tr('common.allStatuses')}</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                className="field !w-auto"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as Category | 'All');
                  setVisible(PAGE_SIZE);
                }}
                aria-label="Filter by category"
              >
                <option value="All">{tr('common.allCategories')}</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-500">
              <Filter className="h-3 w-3" /> {filtered.length} of {reports.length} reports
            </p>
          </Panel>

          {shown.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-6 w-6" />}
              title="No reports found"
              description="Nothing matches this search and filter combination."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setStatus('All');
                    setCategory('All');
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {shown.map((r) => (
                <Link
                  key={r.id}
                  to={`/app/tracking/${r.id}`}
                  className="group block rounded-xl border border-white/[0.07] bg-white/[0.022] p-4 transition hover:border-pulse-sky/25 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] text-ink-500">#{shortId(r.id)}</span>
                        {r.is_sample && <SampleTag />}
                        {!r.is_sample && (
                          <span className="rounded-full border border-pulse-cyan/30 bg-pulse-cyan/[0.08] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-pulse-cyan">
                            Your report
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 line-clamp-1 font-display text-[14px] font-medium text-ink-100 group-hover:text-white">
                        {r.title}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ink-500">
                        <MapPin className="h-3 w-3 shrink-0" /> {r.area} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <StatusBadge status={r.status} />
                      <PriorityBadge priority={r.priority} />
                    </div>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <CategoryBadge category={r.category} />
                    {r.department && <span className="chip">{r.department}</span>}
                  </div>
                </Link>
              ))}

              {visible < filtered.length && (
                <Button variant="secondary" className="w-full" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Load {Math.min(PAGE_SIZE, filtered.length - visible)} more
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Panel className="!p-4">
            <p className="panel-title">Status guide</p>
            <ol className="mt-3 space-y-2">
              {STATUSES.map((s, i) => (
                <li key={s} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-[9px] text-ink-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[11.5px] text-ink-200">{s}</p>
                    <p className="text-[10px] leading-relaxed text-ink-500">
                      {[
                        'Report recorded in the demo workspace.',
                        'An admin has opened it for triage.',
                        'A demo department has been assigned.',
                        'Work is marked as underway (simulated).',
                        'Closed in the demo dataset only.',
                      ][i]}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className="!p-4">
            <p className="panel-title">My submissions</p>
            <p className="mt-1 text-[10px] text-ink-500">Citizen demo account</p>
            <div className="mt-3 space-y-2">
              {myReports.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/10 p-3 text-[11px] text-ink-500">
                  No reports from this demo account yet.
                </p>
              ) : (
                myReports.slice(0, 5).map((r) => (
                  <Link
                    key={r.id}
                    to={`/app/tracking/${r.id}`}
                    className="block rounded-lg border border-white/[0.06] p-2 transition hover:bg-white/[0.04]"
                  >
                    <p className="line-clamp-1 text-[11px] text-ink-200">{r.title}</p>
                    <div className="mt-1"><StatusBadge status={r.status} /></div>
                  </Link>
                ))
              )}
            </div>
          </Panel>

          <Panel className="!p-4 border-amber-300/15 bg-amber-300/[0.03]">
            <p className="text-[11px] font-medium text-amber-200/90">Demo transparency</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-ink-500">
              No status on this page represents real-world resolution. Sample reports are labelled, and your submissions
              stay in this browser.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
