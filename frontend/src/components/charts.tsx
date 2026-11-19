import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CATEGORY_MAP, STATUSES, STATUS_STYLE } from '../lib/categories';
import type { Report } from '../types';

const tooltipStyle = {
  background: 'rgba(8,14,31,0.96)',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: 12,
  fontSize: 12,
  color: '#EAF2FF',
  boxShadow: '0 24px 60px -30px rgba(0,0,0,0.9)',
} as const;

export function reportsOverTime(reports: Report[], days = 14) {
  const buckets: { label: string; reports: number; resolved: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d.getTime() + 86_400_000);
    const dayReports = reports.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= d.getTime() && t < next.getTime();
    });
    buckets.push({
      label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      reports: dayReports.length,
      resolved: dayReports.filter((r) => r.status === 'Resolved').length,
    });
  }
  return buckets;
}

export function TrendChart({ reports }: { reports: Report[] }) {
  const data = reportsOverTime(reports);
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.42} />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="resolvedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#5B6E92', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
        <YAxis tick={{ fill: '#5B6E92', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="reports" stroke="#22D3EE" strokeWidth={2} fill="url(#reportFill)" name="Reported" />
        <Area type="monotone" dataKey="resolved" stroke="#A78BFA" strokeWidth={2} fill="url(#resolvedFill)" name="Resolved" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryChart({ reports }: { reports: Report[] }) {
  const data = Object.values(CATEGORY_MAP).map((c) => ({
    name: c.short,
    value: reports.filter((r) => r.category === c.id).length,
    color: c.color,
  }));
  return (
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={52}
          outerRadius={80}
          paddingAngle={3}
          stroke="rgba(4,7,15,0.9)"
          strokeWidth={2}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatusChart({ reports }: { reports: Report[] }) {
  const data = STATUSES.map((s) => ({
    name: s,
    value: reports.filter((r) => r.status === s).length,
    color: STATUS_STYLE[s].dot,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#5B6E92', fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={{ fill: '#5B6E92', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryBars({ reports }: { reports: Report[] }) {
  const total = Math.max(1, reports.length);
  return (
    <div className="space-y-3">
      {Object.values(CATEGORY_MAP).map((c) => {
        const count = reports.filter((r) => r.category === c.id).length;
        return (
          <div key={c.id}>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-ink-300">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                {c.label}
              </span>
              <span className="tabular-nums text-ink-400">{count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(count / total) * 100}%`, background: c.color, opacity: 0.85 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
