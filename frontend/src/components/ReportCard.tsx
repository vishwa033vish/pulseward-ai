import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Report } from '../types';
import { CATEGORY_MAP } from '../lib/categories';
import { timeAgo, shortId } from '../lib/format';
import { CategoryBadge, PriorityBadge, SampleTag, StatusBadge } from './ui';

export function ReportCard({ report, compact }: { report: Report; compact?: boolean }) {
  const meta = CATEGORY_MAP[report.category];
  return (
    <Link
      to={`/app/tracking/${report.id}`}
      className="group block rounded-xl border border-white/[0.06] bg-white/[0.018] p-3.5 transition hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.035]"
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 h-9 w-9 shrink-0 rounded-lg border"
          style={{ background: meta.soft, borderColor: `${meta.color}33` }}
        >
          {report.image_url ? (
            <img src={report.image_url} alt="" className="h-full w-full rounded-lg object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center">
              <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-[13px] font-medium text-ink-100 group-hover:text-white">
              {report.title}
            </p>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-500 transition group-hover:text-pulse-sky" />
          </div>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ink-500">
            <MapPin className="h-3 w-3" /> {report.area}
          </p>
          {!compact && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={report.category} />
              <PriorityBadge priority={report.priority} />
              <StatusBadge status={report.status} />
              {report.is_sample && <SampleTag />}
            </div>
          )}
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-500">
            <span className="font-mono">#{shortId(report.id)}</span>
            <span>{timeAgo(report.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
