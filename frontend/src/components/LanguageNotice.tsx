import { useState } from 'react';
import { Languages, X } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/AppStore';
import { translate } from '../lib/i18n';

const DISMISS_KEY = 'pulseward.languageNoticeDismissed.v1';

/**
 * Shown whenever the interface language is Tamil, so the toggle never implies
 * more coverage than the app actually has: report text and AI output are not
 * machine-translated.
 */
export function LanguageNotice({ floating = false }: { floating?: boolean }) {
  const { language } = useApp();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (language !== 'ta' || dismissed) return null;

  return (
    <div
      className={clsx(
        floating
          ? 'fixed inset-x-0 top-16 z-40 mx-auto w-full max-w-3xl px-5'
          : 'border-b border-pulse-sky/15 bg-pulse-sky/[0.05] px-4 py-2 md:px-6',
      )}
      role="note"
    >
      <div
        className={clsx(
          'flex items-start gap-2 rounded-xl border border-pulse-sky/20 bg-midnight-900/90 px-3 py-2 backdrop-blur-xl',
          !floating && 'border-0 bg-transparent px-0 py-0 backdrop-blur-none',
        )}
      >
        <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pulse-sky" />
        <p className="flex-1 text-[11px] leading-relaxed text-ink-300">
          <span className="font-medium text-ink-100">{translate('notice.title', language)}:</span>{' '}
          {translate('notice.body', language)}
        </p>
        <button
          onClick={() => {
            setDismissed(true);
            try {
              sessionStorage.setItem(DISMISS_KEY, '1');
            } catch {
              /* dismissal is best-effort only */
            }
          }}
          aria-label={translate('notice.dismiss', language)}
          className="rounded p-1 text-ink-500 transition hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
