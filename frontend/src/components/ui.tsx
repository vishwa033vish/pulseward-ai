import React from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react';
import { PRIORITY_STYLE, STATUS_STYLE, CATEGORY_MAP } from '../lib/categories';
import type { Category, Priority, Status } from '../types';
import { useApp } from '../store/AppStore';

/* ------------------------------------------------------------------ */
/*  Button                                                             */
/* ------------------------------------------------------------------ */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3.5 text-sm md:text-base',
        variant === 'primary' &&
          'bg-gradient-to-r from-pulse-cyan to-pulse-sky text-midnight-950 shadow-[0_16px_40px_-18px_rgba(34,211,238,0.8)] hover:brightness-110 active:translate-y-px',
        variant === 'secondary' &&
          'border border-white/12 bg-white/[0.05] text-ink-100 hover:border-pulse-sky/40 hover:bg-white/[0.08]',
        variant === 'soft' &&
          'border border-pulse-sky/25 bg-pulse-sky/10 text-pulse-sky hover:bg-pulse-sky/15',
        variant === 'ghost' && 'text-ink-300 hover:bg-white/[0.06] hover:text-ink-100',
        variant === 'danger' &&
          'border border-rose-400/30 bg-rose-500/12 text-rose-200 hover:bg-rose-500/20',
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Surfaces                                                           */
/* ------------------------------------------------------------------ */
export function Panel({
  className,
  children,
  as: Tag = 'div',
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { as?: React.ElementType }) {
  return (
    <Tag className={clsx('glass p-5', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-pulse-sky/80">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-[26px]">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-ink-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Badges                                                             */
/* ------------------------------------------------------------------ */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap',
        className,
      )}
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const s = PRIORITY_STYLE[priority];
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap',
        className,
      )}
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {priority}
    </span>
  );
}

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  const meta = CATEGORY_MAP[category];
  const { language } = useApp();
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap',
        className,
      )}
      style={{
        color: meta.color,
        background: meta.soft,
        borderColor: `${meta.color}44`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {language === 'ta' ? meta.labelTa : meta.label}
    </span>
  );
}

export function SampleTag({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-300/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90',
        className,
      )}
    >
      Sample data
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-midnight-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={clsx(
              'relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-midnight-850/95 shadow-panel backdrop-blur-2xl sm:rounded-3xl',
              wide ? 'sm:max-w-4xl' : 'sm:max-w-lg',
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
                {description && <p className="mt-1 text-xs leading-relaxed text-ink-400">{description}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-ink-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4 sm:px-6">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4 sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Toasts                                                             */
/* ------------------------------------------------------------------ */
export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24 }}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 bg-midnight-800/95 p-3.5 shadow-panel backdrop-blur-xl"
          >
            <div
              className={clsx(
                'mt-0.5 rounded-lg p-1.5',
                toast.tone === 'success' && 'bg-emerald-400/12 text-emerald-300',
                toast.tone === 'error' && 'bg-rose-400/12 text-rose-300',
                toast.tone === 'info' && 'bg-pulse-sky/12 text-pulse-sky',
              )}
            >
              {toast.tone === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : toast.tone === 'error' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-ink-500 transition hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state / Spinner                                             */
/* ------------------------------------------------------------------ */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
      <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-pulse-sky">{icon}</div>
      <p className="font-display text-base font-semibold text-ink-100">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-300">
      <Loader2 className="h-4 w-4 animate-spin text-pulse-sky" />
      {label}
    </div>
  );
}

export function ProgressBar({ value, tone = 'cyan' }: { value: number; tone?: 'cyan' | 'violet' | 'amber' }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className={clsx(
          'h-full rounded-full transition-all duration-700',
          tone === 'cyan' && 'bg-gradient-to-r from-pulse-cyan to-pulse-sky',
          tone === 'violet' && 'bg-gradient-to-r from-pulse-violet to-pulse-sky',
          tone === 'amber' && 'bg-gradient-to-r from-amber-400 to-orange-400',
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
