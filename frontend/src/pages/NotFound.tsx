import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-pulse-sky">
        <Compass className="h-6 w-6" />
      </div>
      <p className="mt-5 font-display text-[11px] uppercase tracking-[0.24em] text-ink-500">Signal lost</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-white">This route doesn't exist</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-400">
        The page you're looking for isn't part of the PulseWard demo. Head back to the command center.
      </p>
      <div className="mt-6 flex gap-2">
        <Link to="/app"><Button>Open dashboard</Button></Link>
        <Link to="/"><Button variant="secondary">Back to home</Button></Link>
      </div>
    </div>
  );
}
