import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  ChevronDown,
  Gauge,
  Info,
  Radar,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../store/AppStore';
import { translate } from '../lib/i18n';
import { useDocumentTitle } from '../hooks/usePrefersReducedMotion';
import { Button, Panel, PriorityBadge, ProgressBar, SectionHeading } from '../components/ui';
import { CATEGORIES } from '../lib/categories';
import { PRIORITY_DISCLAIMER, scorePriority } from '../lib/priority';
import { countNearbyReports } from '../lib/priority';
import type { Category, Priority, Severity } from '../types';

const SEVERITIES: Severity[] = ['Low', 'Moderate', 'Severe', 'Critical'];
const PRIORITY_RANK: Record<Priority, number> = { Low: 0, Medium: 1, High: 2, Urgent: 3 };

export function PriorityPage() {
  useDocumentTitle('AI Priority Intelligence');
  const { reports, language } = useApp();
  const tr = (key: string) => translate(key, language);

  const [category, setCategory] = useState<Category>('drainage');
  const [severity, setSeverity] = useState<Severity>('Severe');
  const [description, setDescription] = useState(
    'Open manhole beside a school gate, children walk past it every morning.',
  );
  const [nearby, setNearby] = useState(2);
  const [essential, setEssential] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const simulation = useMemo(
    () =>
      scorePriority({
        category,
        severity,
        description,
        nearbyReports: nearby,
        essentialInfrastructure: essential,
      }),
    [category, severity, description, nearby, essential],
  );

  const ranked = useMemo(
    () =>
      [...reports]
        .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || b.priority_score - a.priority_score)
        .slice(0, 8),
    [reports],
  );

  const distribution = useMemo(
    () =>
      (['Urgent', 'High', 'Medium', 'Low'] as Priority[]).map((p) => ({
        priority: p,
        count: reports.filter((r) => r.priority === p).length,
      })),
    [reports],
  );

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow={tr('priority.eyebrow')}
        title={tr('priority.title')}
        description={tr('priority.description')}
        action={
          <span className="chip border-pulse-violet/25 text-pulse-violet">
            <Radar className="h-3 w-3" /> 5 weighted factors
          </span>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        {/* Simulator */}
        <Panel>
          <div className="flex items-center justify-between">
            <p className="panel-title flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-pulse-sky" /> What-if simulator
            </p>
            <span className="text-[9px] uppercase tracking-wider text-ink-500">live</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
            Change the inputs and watch the score recalculate. This uses the same engine as the reporting flow.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="sim-category">Problem category</label>
              <select
                id="sim-category"
                className="field"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Visible severity</label>
              <div className="grid grid-cols-4 gap-1.5">
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`rounded-lg border px-1 py-1.5 text-[10.5px] transition ${
                      severity === s
                        ? 'border-pulse-sky/60 bg-pulse-sky/12 text-pulse-sky'
                        : 'border-white/10 text-ink-400 hover:text-ink-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="sim-desc">Description (safety context is read from text)</label>
              <textarea
                id="sim-desc"
                className="field min-h-[72px] resize-y text-[12px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention schools, hospitals, night-time risk, accidents…"
              />
            </div>

            <div>
              <label className="label" htmlFor="sim-nearby">
                Similar reports within ~750 m: <span className="text-ink-200">{nearby}</span>
              </label>
              <input
                id="sim-nearby"
                type="range"
                min={0}
                max={8}
                step={1}
                value={nearby}
                onChange={(e) => setNearby(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <span className="text-[11.5px] text-ink-300">
                Near essential infrastructure
                <span className="mt-0.5 block text-[10px] text-ink-600">School, hospital, transit hub or main road</span>
              </span>
              <input
                type="checkbox"
                checked={essential}
                onChange={(e) => setEssential(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
            </label>
          </div>
        </Panel>

        {/* Result */}
        <div className="space-y-4">
          <Panel className="relative overflow-hidden">
            <div className="orb -right-10 -top-16 h-44 w-44 bg-pulse-cyan/15" />
            <div className="relative">
              <p className="panel-title flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-pulse-sky" /> Estimated priority
              </p>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-5xl font-semibold leading-none text-white">
                  {simulation.score}
                  <span className="text-base text-ink-500">/100</span>
                </p>
                <PriorityBadge priority={simulation.priority} />
              </div>
              <div className="mt-4">
                <ProgressBar value={simulation.score} tone={simulation.score >= 80 ? 'amber' : 'cyan'} />
                <div className="mt-1 flex justify-between text-[9px] text-ink-600">
                  <span>Low</span><span>Medium</span><span>High</span><span>Urgent</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { k: 'Category weight', v: simulation.factors.categoryWeight },
                  { k: 'Severity weight', v: simulation.factors.severityWeight },
                  { k: 'Safety impact', v: simulation.factors.safetyImpact },
                  { k: 'Recurrence', v: Math.min(4, simulation.factors.nearbyReports) * 25 },
                ].map((f) => (
                  <div key={f.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <p className="text-[9px] uppercase tracking-wider text-ink-500">{f.k}</p>
                    <p className="mt-1 font-display text-sm text-ink-100">{f.v}<span className="text-[10px] text-ink-600">/100</span></p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="label flex items-center gap-1">
                  <BrainCircuit className="h-3 w-3" /> Why this score
                </p>
                <ul className="space-y-1.5">
                  {simulation.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2 text-[11px] leading-relaxed text-ink-400">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pulse-violet" /> {r}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-300/15 bg-amber-300/[0.05] p-2.5 text-[10px] leading-relaxed text-amber-200/80">
                <Info className="mt-0.5 h-3 w-3 shrink-0" /> {PRIORITY_DISCLAIMER}
              </p>
            </div>
          </Panel>

          <Panel>
            <p className="panel-title">City priority distribution</p>
            <div className="mt-3 space-y-2.5">
              {distribution.map((d) => (
                <div key={d.priority}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <PriorityBadge priority={d.priority} />
                    <span className="text-ink-400">{d.count} reports</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pulse-violet/70 to-pulse-sky/70 transition-all duration-500"
                      style={{ width: `${(d.count / Math.max(1, reports.length)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Ranked reports */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="panel-title">Ranked reports</p>
            <p className="mt-1 text-[11px] text-ink-500">
              Highest estimated priority first. Expand a row to see its stored explanation.
            </p>
          </div>
          <Link to="/app/admin" className="flex items-center gap-1 text-[11px] text-pulse-sky hover:underline">
            Triage in admin <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-white/[0.05]">
          {ranked.map((r) => {
            const open = openId === r.id;
            return (
              <div key={r.id} className="py-2">
                <button
                  onClick={() => setOpenId(open ? null : r.id)}
                  className="flex w-full items-center gap-3 text-left"
                  aria-expanded={open}
                >
                  <span className="w-9 shrink-0 font-display text-sm font-semibold tabular-nums text-ink-300">
                    {r.priority_score}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-[12.5px] text-ink-100">{r.title}</span>
                    <span className="mt-0.5 block text-[10px] text-ink-500">
                      {r.area} · {r.status} · {countNearbyReports(r, reports)} similar nearby
                    </span>
                  </span>
                  <PriorityBadge priority={r.priority} />
                  <ChevronDown className={`h-4 w-4 shrink-0 text-ink-500 transition ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="mt-2 space-y-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    {r.priority_reasons.map((reason, i) => (
                      <p key={i} className="flex gap-2 text-[10.5px] leading-relaxed text-ink-400">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-pulse-violet" /> {reason}
                      </p>
                    ))}
                    <div className="pt-1">
                      <Link
                        to={`/app/tracking/${r.id}`}
                        className="text-[10.5px] font-medium text-pulse-sky hover:underline"
                      >
                        Open report →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="border-white/[0.06]">
        <p className="panel-title">How the model works</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          {[
            { k: '34%', t: 'Category baseline', d: 'Drainage 80, roads 72, water 68, lights 58, waste 46, infra 50.' },
            { k: '36%', t: 'Visible severity', d: 'From the image analysis severity label.' },
            { k: '14%', t: 'Safety context', d: 'Keywords such as accident, school, night, open manhole.' },
            { k: '+13', t: 'Recurrence', d: 'Up to 6 similar reports within 750 m, 2.2 pts each.' },
            { k: '+7', t: 'Essential infra', d: 'Hospital, school, transit or main-road proximity.' },
          ].map((f) => (
            <div key={f.k} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="font-display text-sm font-semibold text-pulse-sky">{f.k}</p>
              <p className="mt-1 text-[11px] font-medium text-ink-200">{f.t}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-ink-500">{f.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-ink-600">
          Bands: Low &lt; 40 · Medium 40–61 · High 62–79 · Urgent 80+. The same weights are implemented in
          <span className="font-mono text-ink-400"> frontend/src/lib/priority.ts</span> and
          <span className="font-mono text-ink-400"> backend/app/services/priority.py</span>.
        </p>
      </Panel>
    </div>
  );
}
