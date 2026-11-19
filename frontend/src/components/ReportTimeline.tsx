import { Check } from 'lucide-react';
import { STATUSES, STATUS_STYLE } from '../lib/categories';
import type { Report, Status } from '../types';
import { formatDate } from '../lib/format';

/**
 * Vertical status timeline. Steps after the current status are shown as
 * pending; every event is a demo event unless it came from a live backend.
 */
export function ReportTimeline({ report }: { report: Report }) {
  const currentIndex = STATUSES.indexOf(report.status);
  return (
    <ol className="relative space-y-0">
      {STATUSES.map((status, index) => {
        const event = [...report.status_history].reverse().find((e) => e.status === status);
        const done = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const style = STATUS_STYLE[status as Status];
        return (
          <li key={status} className="relative flex gap-3 pb-5 last:pb-0">
            {index < STATUSES.length - 1 && (
              <span
                className="absolute left-[11px] top-6 h-[calc(100%-14px)] w-px"
                style={{ background: done && index < currentIndex ? `${style.dot}66` : 'rgba(148,163,184,0.14)' }}
              />
            )}
            <span
              className="relative z-10 mt-0.5 grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full border text-[9px]"
              style={{
                background: done ? style.bg : 'rgba(255,255,255,0.03)',
                borderColor: done ? style.border : 'rgba(148,163,184,0.18)',
                color: done ? style.color : '#5B6E92',
                boxShadow: isCurrent ? `0 0 0 4px ${style.bg}` : undefined,
              }}
            >
              {done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p
                  className="text-[13px] font-medium"
                  style={{ color: done ? '#EAF2FF' : '#5B6E92' }}
                >
                  {status}
                  {isCurrent && (
                    <span className="ml-2 rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink-400">
                      current
                    </span>
                  )}
                </p>
                <span className="text-[10px] text-ink-500">
                  {event ? formatDate(event.at, true) : 'Pending'}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
                {event
                  ? event.note ?? 'Status updated'
                  : `Awaiting the ${status.toLowerCase()} stage. Demo workflow only.`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
