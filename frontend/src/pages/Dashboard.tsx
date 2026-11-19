import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Flame,
  Gauge,
  MapPin,
  ScanLine,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useDocumentTitle } from '../hooks/usePrefersReducedMotion';
import { SectionHeading, Panel, Button, StatusBadge, PriorityBadge, SampleTag, ProgressBar } from '../components/ui';
import { CategoryBars, CategoryChart, StatusChart, TrendChart } from '../components/charts';
import { ReportCard } from '../components/ReportCard';
import { CATEGORY_MAP } from '../lib/categories';
import { timeAgo } from '../lib/format';

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  progress,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: React.ElementType;
  accent: string;
  progress?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass relative overflow-hidden p-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">{label}</p>
          <p className="mt-1.5 font-display text-[28px] font-semibold leading-none text-white">{value}</p>
        </div>
        <span
          className="grid h-9 w-9 place-items-center rounded-xl border"
          style={{ background: `${accent}14`, borderColor: `${accent}33`, color: accent }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-[11px] text-ink-500">{hint}</p>
      {typeof progress === 'number' && (
        <div className="mt-3">
          <ProgressBar value={progress} />
        </div>
      )}
    </motion.div>
  );
}

export function DashboardPage() {
  useDocumentTitle('Citizen Dashboard');
  const { reports, profile } = useApp();

  const stats = useMemo(() => {
    const open = reports.filter((r) => r.status !== 'Resolved');
    return {
      total: reports.length,
      open: open.length,
      review: reports.filter((r) => r.status === 'Under Review').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
      mine: reports.filter((r) => r.user_id === profile?.id).length,
      urgent: reports.filter((r) => r.priority === 'Urgent' && r.status !== 'Resolved').length,
      samples: reports.filter((r) => r.is_sample).length,
    };
  }, [reports, profile]);

  const recent = useMemo(
    () => [...reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [reports],
  );
  const mine = useMemo(
    () =>
      reports
        .filter((r) => r.user_id === profile?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4),
    [reports, profile],
  );

  const resolutionRate = stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const topCategory = useMemo(() => {
    const counts = new Map<string, number>();
    reports.forEach((r) => counts.set(r.category, (counts.get(r.category) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? { meta: CATEGORY_MAP[top[0] as keyof typeof CATEGORY_MAP], count: top[1] } : null;
  }, [reports]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-pulse-sky/80">
            <Activity className="h-3 w-3" /> Civic overview
          </p>
          <h1 className="mt-2 font-display text-[26px] font-semibold tracking-tight text-white md:text-3xl">
            {profile ? `Good to see you, ${profile.display_name.split(' ')[0]}.` : 'City pulse, right now.'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {stats.open} open issues across Chennai in this demo workspace — {stats.urgent} flagged urgent by AI.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SampleTag />
          <Link to="/app/scan">
            <Button icon={<ScanLine className="h-4 w-4" />}>New AI scan</Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total reports" value={stats.total} hint={`${stats.samples} sample reports included`} icon={ClipboardList} accent="#38BDF8" />
        <Kpi label="Open reports" value={stats.open} hint="Not yet resolved" icon={Clock3} accent="#FBBF24" progress={stats.total ? (stats.open / stats.total) * 100 : 0} />
        <Kpi label="Under review" value={stats.review} hint="Awaiting triage decision" icon={Gauge} accent="#A78BFA" />
        <Kpi label="Resolved" value={stats.resolved} hint={`${resolutionRate}% resolution rate (demo)`} icon={CheckCircle2} accent="#4ADE80" progress={resolutionRate} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="panel-title">Report volume</p>
              <p className="mt-1 text-[11px] text-ink-500">Last 14 days · reported vs resolved</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-ink-400">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-pulse-cyan" /> Reported</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-pulse-violet" /> Resolved</span>
            </div>
          </div>
          <TrendChart reports={reports} />
        </Panel>

        <Panel>
          <div className="mb-2">
            <p className="panel-title">Category mix</p>
            <p className="mt-1 text-[11px] text-ink-500">Where issues concentrate</p>
          </div>
          <CategoryChart reports={reports} />
          {topCategory && (
            <div className="mt-1 rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5 text-[11px] text-ink-400">
              <span className="text-ink-300">Top category: </span>
              <span style={{ color: topCategory.meta.color }}>{topCategory.meta.label}</span>
              <span> · {topCategory.count} reports</span>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="panel-title">Recent activity</p>
              <p className="mt-1 text-[11px] text-ink-500">Newest reports across the city</p>
            </div>
            <Link to="/app/tracking" className="flex items-center gap-1 text-[11px] font-medium text-pulse-sky hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </Panel>

        {/* Community impact + my reports */}
        <div className="space-y-4">
          <Panel>
            <p className="panel-title">Community impact</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { k: 'Citizens engaged', v: new Set(reports.map((r) => r.user_id)).size, icon: Users, c: '#22D3EE' },
                { k: 'Urgent open', v: stats.urgent, icon: Flame, c: '#F87171' },
                { k: 'Resolved (demo)', v: stats.resolved, icon: CheckCircle2, c: '#4ADE80' },
                { k: 'Areas covered', v: new Set(reports.map((r) => r.area)).size, icon: MapPin, c: '#A78BFA' },
              ].map((item) => (
                <div key={item.k} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <item.icon className="h-3.5 w-3.5" style={{ color: item.c }} />
                  <p className="mt-1.5 font-display text-lg font-semibold text-white">{item.v}</p>
                  <p className="text-[10px] leading-tight text-ink-500">{item.k}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <CategoryBars reports={reports} />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <p className="panel-title">My reports</p>
              <span className="text-[10px] text-ink-500">{mine.length} recent</span>
            </div>
            {mine.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-white/10 p-4 text-center">
                <p className="text-[12px] text-ink-400">You haven't submitted a report in this session.</p>
                <Link to="/app/scan" className="mt-2 inline-block text-[11px] font-medium text-pulse-sky hover:underline">
                  Run your first AI scan →
                </Link>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {mine.map((r) => (
                  <Link
                    key={r.id}
                    to={`/app/tracking/${r.id}`}
                    className="block rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:bg-white/[0.04]"
                  >
                    <p className="line-clamp-1 text-[12px] text-ink-100">{r.title}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <StatusBadge status={r.status} />
                      <span className="text-[10px] text-ink-500">{timeAgo(r.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <p className="panel-title">Status distribution</p>
            <TrendingUp className="h-4 w-4 text-ink-500" />
          </div>
          <StatusChart reports={reports} />
        </Panel>

        <Panel className="flex flex-col justify-between">
          <div>
            <p className="panel-title">Priority radar</p>
            <p className="mt-1 text-[11px] text-ink-500">Highest estimated-risk open reports</p>
            <div className="mt-3 space-y-2">
              {[...reports]
                .filter((r) => r.status !== 'Resolved')
                .sort((a, b) => b.priority_score - a.priority_score)
                .slice(0, 3)
                .map((r) => (
                  <Link
                    key={r.id}
                    to={`/app/tracking/${r.id}`}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:bg-white/[0.04]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[12px] text-ink-100">{r.title}</p>
                      <p className="mt-0.5 text-[10px] text-ink-500">{r.area}</p>
                    </div>
                    <PriorityBadge priority={r.priority} />
                    <span className="w-8 text-right font-mono text-[11px] text-ink-400">{r.priority_score}</span>
                  </Link>
                ))}
            </div>
          </div>
          <Link to="/app/priority" className="mt-4 flex items-center gap-1 text-[11px] font-medium text-pulse-sky hover:underline">
            Open Priority AI <ArrowRight className="h-3 w-3" />
          </Link>
        </Panel>
      </div>

      <p className="pb-2 text-[10px] leading-relaxed text-ink-600">
        All metrics are computed from the demo dataset in this browser. Sample reports are tagged, and no data is
        transmitted to a municipality.
      </p>
    </div>
  );
}
