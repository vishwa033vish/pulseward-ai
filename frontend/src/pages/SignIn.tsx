import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, ArrowRight, Shield, User, Lock, Info } from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useDocumentTitle } from '../hooks/usePrefersReducedMotion';
import { Button } from '../components/ui';

export function SignInPage() {
  useDocumentTitle('Demo sign in');
  const { signIn, profile, language, setLanguage } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [loading, setLoading] = useState<'citizen' | 'admin' | null>(null);
  const ta = language === 'ta';

  function choose(role: 'citizen' | 'admin') {
    setLoading(role);
    // Small delay to make the transition feel deliberate.
    window.setTimeout(() => {
      signIn(role);
      navigate(next || (role === 'admin' ? '/app/admin' : '/app'), { replace: true });
      setLoading(null);
    }, 450);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_50%_-10%,rgba(34,211,238,0.14),transparent_65%)]" />
      <div className="absolute left-1/2 top-1/3 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-pulse-violet/10 blur-[90px]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-pulse-sky/30 bg-pulse-cyan/10">
              <Activity className="h-4 w-4 text-pulse-cyan" />
            </span>
            <span className="font-display text-sm font-semibold text-white">PulseWard AI</span>
          </Link>
          <button
            onClick={() => setLanguage(ta ? 'en' : 'ta')}
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-ink-300 hover:text-white"
          >
            {ta ? 'English' : 'தமிழ்'}
          </button>
        </div>

        <div className="glass-strong p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
            {ta ? 'டெமோ கணக்கை தேர்ந்தெடுங்கள்' : 'Choose a demo session'}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-400">
            {ta
              ? 'இந்த டெமோவில் கடவுச்சொல் தேவையில்லை. Supabase Auth இணைக்கப்பட்டால் உண்மையான உள்நுழைவு பயன்படுத்தப்படும்.'
              : 'No password needed in the demo build. When Supabase Auth is configured, real email / OAuth sign-in replaces these cards.'}
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => choose('citizen')}
              disabled={loading !== null}
              className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-pulse-sky/35 hover:bg-white/[0.05] disabled:opacity-60"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-pulse-sky/25 bg-pulse-sky/10 text-pulse-sky">
                <User className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                  Aarav Raj · Citizen
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink-400">
                    demo
                  </span>
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-ink-400">
                  Submit reports, run AI scans, track status and chat with the assistant.
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-500 transition group-hover:translate-x-0.5 group-hover:text-pulse-sky" />
            </button>

            <button
              onClick={() => choose('admin')}
              disabled={loading !== null}
              className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-pulse-violet/35 hover:bg-white/[0.05] disabled:opacity-60"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-pulse-violet/25 bg-pulse-violet/10 text-pulse-violet">
                <Shield className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                  Priya Menon · Admin
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink-400">
                    demo
                  </span>
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-ink-400">
                  Command center: triage, assign demo departments, update status, view hotspots.
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-500 transition group-hover:translate-x-0.5 group-hover:text-pulse-violet" />
            </button>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/[0.07] bg-midnight-950/40 p-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pulse-sky" />
            <p className="text-[11px] leading-relaxed text-ink-500">
              Sessions are local to this browser and exist only for the demo. No credentials are stored or transmitted.
              {profile && ' You are already signed in — choosing a session switches the role.'}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1.5 text-[11px] text-ink-400 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to site
            </Link>
            <span className="flex items-center gap-1 text-[10px] text-ink-600">
              <Lock className="h-3 w-3" /> RLS-ready schema included
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
