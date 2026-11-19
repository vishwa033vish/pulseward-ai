import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChevronDown,
  ClipboardCheck,
  FileSearch,
  Gauge,
  Globe2,
  Layers,
  MapPin,
  Radar,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useDocumentTitle, usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { FloatingAssistantButton } from '../components/Layout';
import { Button } from '../components/ui';

const CityScene = lazy(() => import('../components/CityScene').then((m) => ({ default: m.CityScene })));

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration, reduced]);
  return value;
}

function Stat({ value, suffix, label, start }: { value: number; suffix?: string; label: string; start: boolean }) {
  const n = useCountUp(value, start);
  return (
    <div>
      <p className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {n.toLocaleString('en-IN')}
        <span className="text-pulse-sky">{suffix}</span>
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ink-400">{label}</p>
    </div>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 26 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const HOW_IT_WORKS = [
  {
    icon: ScanLine,
    title: 'Capture',
    body: 'Take a photo of the pothole, garbage pile, leak or broken light. Add a short note in English or Tamil.',
  },
  {
    icon: BrainCircuit,
    title: 'AI analysis',
    body: 'The vision model suggests a category, visible evidence, severity and a recommended action — labeled as an estimate.',
  },
  {
    icon: Gauge,
    title: 'Priority intelligence',
    body: 'An explainable score weighs severity, safety context, recurring reports nearby and essential-infrastructure proximity.',
  },
  {
    icon: MapPin,
    title: 'Map & track',
    body: 'The report lands on the city map. Citizens track status; admins triage, assign and update progress.',
  },
];

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Multimodal problem analysis',
    body: 'Structured, validated JSON from image analysis: category, evidence, severity, confidence and action.',
    accent: '#22D3EE',
  },
  {
    icon: Radar,
    title: 'Explainable priority',
    body: 'Every Low → Urgent rating shows the five factors behind it. No black-box scores.',
    accent: '#A78BFA',
  },
  {
    icon: Layers,
    title: 'Live city map',
    body: 'Leaflet + OpenStreetMap with clustering, category and status filters, and click-through report details.',
    accent: '#34D399',
  },
  {
    icon: FileSearch,
    title: 'Smart report drafting',
    body: 'AI analysis pre-fills a structured report you can edit, save as draft, or submit in seconds.',
    accent: '#F59E0B',
  },
  {
    icon: Users,
    title: 'Citizen + admin views',
    body: 'A friendly reporting flow for residents, and a command center with triage, assignments and hotspots.',
    accent: '#38BDF8',
  },
  {
    icon: Globe2,
    title: 'Tamil + English',
    body: 'Interface and assistant in both languages, with Tanglish-friendly inputs so nobody is locked out.',
    accent: '#F472B6',
  },
];

export function LandingPage() {
  useDocumentTitle('Building Smarter Cities. Together.');
  const { profile, language, setLanguage, signIn } = useApp();
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });

  const headline =
    language === 'ta'
      ? 'புத்திசாலி நகரங்களை உருவாக்குவோம். ஒன்றாக.'
      : 'Building Smarter Cities. Together.';
  const sub =
    language === 'ta'
      ? 'PulseWard AI உங்கள் புகைப்படத்தை ஒரு தெளிவான குடிமை புகாராக மாற்றி, அதை நகர வரைபடத்தில் காட்டி, தீவிரத்தின் அடிப்படையில் முன்னுரிமை அளிக்கிறது.'
      : 'PulseWard AI turns a photo of a civic problem into a structured, map-located report — then helps communities and city teams understand, prioritise and track it.';

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.05] bg-midnight-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-pulse-sky/30 bg-gradient-to-br from-pulse-cyan/20 to-pulse-violet/20">
              <Activity className="h-4 w-4 text-pulse-cyan" strokeWidth={2.4} />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight text-white">
              PulseWard<span className="text-pulse-sky"> AI</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-6 text-[12px] text-ink-300 md:flex">
            <a href="#how" className="transition hover:text-white">How it works</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#impact" className="transition hover:text-white">Impact</a>
            <Link to="/app/map" className="transition hover:text-white">City map</Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-ink-300 transition hover:text-white"
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>
            <Link to={profile ? '/app' : '/signin'} className="hidden sm:block">
              <Button variant="ghost" size="sm">{profile ? 'Open dashboard' : 'Sign in'}</Button>
            </Link>
            <Link to="/app/scan">
              <Button size="sm" icon={<ScanLine className="h-3.5 w-3.5" />}>Report a problem</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(34,211,238,0.16),transparent_65%)]" />
          <div className="absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(circle_at_50%_45%,black,transparent_72%)]">
            <Suspense fallback={<div className="h-full w-full bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.1),transparent_60%)]" />}>
              <CityScene variant="hero" />
            </Suspense>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-midnight-950 via-midnight-950/70 to-transparent" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center text-center"
          >
            <span className="chip border-pulse-cyan/25 bg-pulse-cyan/[0.07] text-pulse-sky">
              <Sparkles className="h-3 w-3" /> AI civic intelligence · demo build for the Smart City track
            </span>

            <h1 className="mt-6 max-w-4xl font-display text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-[76px]">
              {language === 'ta' ? (
                <>
                  புத்திசாலி நகரங்களை
                  <br />
                  <span className="text-gradient">உருவாக்குவோம். ஒன்றாக.</span>
                </>
              ) : (
                <>
                  Building Smarter
                  <br />
                  Cities. <span className="text-gradient">Together.</span>
                </>
              )}
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-300 sm:text-base">
              {sub}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/app/scan">
                <Button size="lg" icon={<ScanLine className="h-4 w-4" />} className="w-full sm:w-auto">
                  Report a Problem
                </Button>
              </Link>
              <Link to="/app">
                <Button size="lg" variant="secondary" icon={<MapPin className="h-4 w-4" />} className="w-full sm:w-auto">
                  Explore City Dashboard
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> No API keys needed to demo</span>
              <span className="text-ink-600">·</span>
              <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> English / தமிழ்</span>
              <span className="text-ink-600">·</span>
              <button onClick={() => signIn('citizen')} className="text-pulse-sky hover:underline">
                Try the demo citizen account
              </button>
            </div>

            <a
              href="#stats"
              className="mt-12 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-ink-500 transition hover:text-ink-300"
            >
              Explore the platform
              <ChevronDown className="h-4 w-4 animate-floaty" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="relative border-y border-white/[0.05] bg-midnight-900/40 py-10">
        <div ref={statsRef} className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 md:grid-cols-4">
          <Stat value={1284} suffix="+" label="Reports submitted (demo)" start={statsInView} />
          <Stat value={946} suffix="" label="Issues resolved (demo)" start={statsInView} />
          <Stat value={6} suffix="" label="Civic categories" start={statsInView} />
          <Stat value={18} suffix="h" label="Avg. triage time (mock)" start={statsInView} />
        </div>
        <p className="mx-auto mt-4 max-w-6xl px-5 text-[10px] text-ink-600">
          Figures above are illustrative demo metrics, not real municipal statistics.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pulse-sky/80">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-[40px]">
              From a single photo to a prioritised civic signal.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-400">
              Four steps, all visible in the product. Nothing is hidden behind a mockup.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-pulse-sky/25 hover:bg-white/[0.04]">
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-pulse-sky/20 bg-pulse-sky/[0.08] text-pulse-sky">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-[11px] text-ink-600">0{i + 1}</span>
                </div>
                <h3 className="font-display text-[15px] font-semibold text-white">{step.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-400">{step.body}</p>
                <div className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-pulse-cyan/40 to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative border-y border-white/[0.05] bg-midnight-900/30 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pulse-sky/80">Capabilities</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-[40px]">
                  A civic operating layer for the whole city.
                </h2>
              </div>
              <Link to="/app" className="text-xs font-medium text-pulse-sky hover:underline">
                See it live →
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.07}>
                <div className="h-full rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-5">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl border"
                    style={{ background: `${f.accent}14`, borderColor: `${f.accent}33`, color: f.accent }}
                  >
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-[15px] font-semibold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-400">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pulse-sky/80">Why it matters</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-[40px]">
              Small issues compound. Visibility changes outcomes.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-400">
              A single pothole is a nuisance; fifty unreported potholes on the same stretch are a safety pattern.
              PulseWard AI turns scattered complaints into a shared, prioritised picture so residents and city teams
              argue less about what happened and more about what to fix first.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { icon: ClipboardCheck, k: 'Faster triage', v: 'Structured reports with severity and location' },
                { icon: Radar, k: 'Recurrence detection', v: 'Nearby duplicates surfaced, not buried' },
                { icon: ShieldCheck, k: 'Safety-first weighting', v: 'Schools, hospitals and night-time risk' },
                { icon: Zap, k: 'Zero-key demo', v: 'Runs end-to-end without any API credentials' },
              ].map((item) => (
                <div key={item.k} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                  <item.icon className="h-4 w-4 text-pulse-sky" />
                  <p className="mt-2 text-[12.5px] font-medium text-white">{item.k}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">{item.v}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass relative overflow-hidden p-6">
              <div className="orb -right-16 -top-16 h-52 w-52 bg-pulse-cyan/20" />
              <div className="orb -bottom-20 -left-10 h-52 w-52 bg-pulse-violet/20" />
              <div className="relative">
                <p className="panel-title">Illustrative municipal signal</p>
                <p className="mt-4 font-display text-5xl font-semibold text-white">
                  6.4<span className="text-pulse-sky">×</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-400">
                  How much more likely an issue is to be attended when it includes a photo, a precise location and a
                  safety context — <span className="text-ink-500">a design hypothesis, not a measured outcome.</span>
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    { label: 'Road damage', pct: 82, color: '#F59E0B' },
                    { label: 'Drainage', pct: 64, color: '#2DD4BF' },
                    { label: 'Garbage', pct: 48, color: '#34D399' },
                    { label: 'Streetlights', pct: 36, color: '#A78BFA' },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="mb-1 flex justify-between text-[11px] text-ink-400">
                        <span>{row.label}</span>
                        <span className="tabular-nums">{row.pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${row.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: row.color, opacity: 0.85 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-white/[0.07] bg-midnight-950/40 p-3">
                  <p className="text-[10px] leading-relaxed text-ink-500">
                    PulseWard AI is a hackathon prototype. It does not claim to send reports to real departments or to
                    verify danger. Demo data is always labelled.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.05] bg-[radial-gradient(900px_420px_at_50%_0%,rgba(34,211,238,0.12),transparent_70%)] py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-[38px]">
            Your street already has the evidence.
            <br />
            <span className="text-gradient-cyan">Give it a voice.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-400">
            Upload one photo and watch the full pipeline — analysis, priority, map placement, tracking and admin triage.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/app/scan">
              <Button size="lg" icon={<ScanLine className="h-4 w-4" />}>Open the AI Scanner</Button>
            </Link>
            <Link to="/signin">
              <Button size="lg" variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>
                Explore demo accounts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.05] py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-pulse-cyan" />
              <span className="font-display text-sm font-semibold text-white">PulseWard AI</span>
            </div>
            <p className="mt-2 max-w-sm text-[11px] leading-relaxed text-ink-500">
              Smart-city civic intelligence. Demo environment — reports stay in your browser and no agency is notified.
            </p>
            <p className="mt-2 text-[11px] font-medium text-ink-400">Designed &amp; built by Vishwa S.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-ink-500">
            <Link to="/app" className="hover:text-ink-200">Dashboard</Link>
            <Link to="/app/map" className="hover:text-ink-200">City map</Link>
            <Link to="/app/priority" className="hover:text-ink-200">Priority AI</Link>
            <Link to="/app/admin" className="hover:text-ink-200">Admin</Link>
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:text-ink-200">
              Map data
            </a>
          </div>
        </div>
      </footer>
      <FloatingAssistantButton />
    </div>
  );
}
