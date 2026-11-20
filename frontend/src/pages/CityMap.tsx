import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Layers, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../store/AppStore';
import { translate } from '../lib/i18n';
import { useDocumentTitle } from '../hooks/usePrefersReducedMotion';
import { MapView } from '../components/MapView';
import { Button, CategoryBadge, EmptyState, Panel, PriorityBadge, SampleTag, SectionHeading, StatusBadge } from '../components/ui';
import { CATEGORIES, CATEGORY_MAP, STATUSES } from '../lib/categories';
import { formatDate, shortId } from '../lib/format';
import type { Category, Priority, Status } from '../types';

export function CityMapPage() {
  useDocumentTitle('City Map');
  const { reports, pushToast, language } = useApp();
  const tr = (key: string) => translate(key, language);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      if (categories.length && !categories.includes(r.category)) return false;
      if (statuses.length && !statuses.includes(r.status)) return false;
      if (priorities.length && !priorities.includes(r.priority)) return false;
      if (q) {
        const haystack = `${r.title} ${r.description} ${r.area} ${r.id} ${r.department ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [reports, categories, statuses, priorities, query]);

  const selected = filtered.find((r) => r.id === selectedId) ?? null;
  const activeFilters = categories.length + statuses.length + priorities.length;

  function toggle<T>(list: T[], value: T, set: (next: T[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function clearAll() {
    setCategories([]);
    setStatuses([]);
    setPriorities([]);
    setQuery('');
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        eyebrow={tr('map.eyebrow')}
        title={tr('map.title')}
        description={tr('map.description')}
        action={
          <div className="flex items-center gap-2">
            <SampleTag />
            <Button
              size="sm"
              variant={showFilters ? 'soft' : 'secondary'}
              icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
              onClick={() => setShowFilters((v) => !v)}
              className="lg:hidden"
            >
              Filters {activeFilters ? `(${activeFilters})` : ''}
            </Button>
          </div>
        }
      />

      {/* Filter bar */}
      <Panel className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[190px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
            <input
              className="field !pl-9"
              placeholder="Search reports, areas or IDs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
          <div className="flex items-center gap-1.5 text-[10px] text-ink-500">
            <Filter className="h-3 w-3" />
            {activeFilters ? `${activeFilters} active` : 'No filters'}
          </div>
          {activeFilters > 0 && (
            <button onClick={clearAll} className="text-[11px] text-pulse-sky hover:underline">
              Clear all
            </button>
          )}
        </div>

        <div className="mt-3 space-y-2.5">
          <FilterRow label="Category">
            {CATEGORIES.map((c) => {
              const on = categories.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggle(categories, c.id, setCategories)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    on ? 'text-white' : 'border-white/10 text-ink-400 hover:text-ink-200'
                  }`}
                  style={on ? { background: `${c.color}20`, borderColor: `${c.color}70`, color: c.color } : undefined}
                >
                  {c.short}
                </button>
              );
            })}
          </FilterRow>
          <FilterRow label="Status">
            {STATUSES.map((s) => {
              const on = statuses.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggle(statuses, s, setStatuses)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    on
                      ? 'border-pulse-sky/60 bg-pulse-sky/12 text-pulse-sky'
                      : 'border-white/10 text-ink-400 hover:text-ink-200'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </FilterRow>
          <FilterRow label="Priority">
            {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((p) => {
              const on = priorities.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => toggle(priorities, p, setPriorities)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    on
                      ? 'border-pulse-violet/60 bg-pulse-violet/12 text-pulse-violet'
                      : 'border-white/10 text-ink-400 hover:text-ink-200'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </FilterRow>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-3">
          <MapView
            reports={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            height="600px"
            fitOnLoad={filtered.length > 0 && filtered.length < 6}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-500">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border border-pulse-cyan bg-pulse-cyan/30" /> Report location
              </span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
                  <span className="relative h-2 w-2 rounded-full bg-amber-400" />
                </span>
                Urgent open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-pulse-cyan/50 bg-pulse-cyan/10 text-[8px]">3</span>
                Cluster
              </span>
            </span>
            <span>© OpenStreetMap contributors · CARTO</span>
          </div>
        </div>

        <div className="space-y-3">
          <Panel className="!p-4">
            <div className="flex items-center justify-between">
              <p className="panel-title flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Reports in view
              </p>
              <span className="chip">{filtered.length}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={<MapPin className="h-5 w-5" />}
                  title="No reports match"
                  description="Adjust or clear the filters to see reports on the map."
                  action={<Button size="sm" variant="secondary" onClick={clearAll}>Clear filters</Button>}
                />
              </div>
            ) : (
              <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedId(r.id);
                      pushToast({ tone: 'info', title: 'Report selected', description: r.title });
                    }}
                    className={`w-full rounded-xl border p-2.5 text-left transition ${
                      selectedId === r.id
                        ? 'border-pulse-cyan/50 bg-pulse-cyan/[0.07]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-[12px] font-medium text-ink-100">{r.title}</p>
                      <span className="shrink-0 font-mono text-[9px] text-ink-500">#{shortId(r.id)}</span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-ink-500">
                      <MapPin className="h-2.5 w-2.5" /> {r.area}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <CategoryBadge category={r.category} />
                      <PriorityBadge priority={r.priority} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Panel>

          {selected && (
            <Panel className="!p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-ink-500">
                    Selected · #{shortId(selected.id)}
                  </p>
                  <h3 className="mt-1 font-display text-[14px] font-semibold leading-snug text-white">
                    {selected.title}
                  </h3>
                </div>
                {selected.is_sample && <SampleTag />}
              </div>
              <p className="mt-2 line-clamp-3 text-[11.5px] leading-relaxed text-ink-400">{selected.description}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <CategoryBadge category={selected.category} />
                <StatusBadge status={selected.status} />
                <PriorityBadge priority={selected.priority} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10.5px]">
                <div>
                  <p className="text-ink-600">Area</p>
                  <p className="text-ink-300">{selected.area}</p>
                </div>
                <div>
                  <p className="text-ink-600">Submitted</p>
                  <p className="text-ink-300">{formatDate(selected.created_at)}</p>
                </div>
                <div>
                  <p className="text-ink-600">Coordinates</p>
                  <p className="font-mono text-ink-300">
                    {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-ink-600">Category</p>
                  <p className="text-ink-300">{CATEGORY_MAP[selected.category].department}</p>
                </div>
              </div>
              <Link to={`/app/tracking/${selected.id}`} className="mt-3 block">
                <Button className="w-full" size="sm">Open full report</Button>
              </Link>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-16 shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </span>
      {children}
    </div>
  );
}
