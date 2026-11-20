import { Suspense, lazy, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Bot,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map as MapIcon,
  Menu,
  Radar,
  ScanLine,
  Shield,
  Sparkles,
  Home,
  X,
  Languages,
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/AppStore';
import { translate } from '../lib/i18n';
import { AssistantPanel } from './AssistantPanel';
import { LanguageNotice } from './LanguageNotice';
import { AI_BACKEND_CONFIGURED } from '../lib/api';
import { Button } from './ui';

const CityScene = lazy(() => import('./CityScene').then((m) => ({ default: m.CityScene })));

export interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/app', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/app/scan', labelKey: 'nav.scanner', icon: ScanLine },
  { to: '/app/map', labelKey: 'nav.map', icon: MapIcon },
  { to: '/app/tracking', labelKey: 'nav.tracking', icon: ClipboardList },
  { to: '/app/priority', labelKey: 'nav.priority', icon: Radar },
  { to: '/app/admin', labelKey: 'nav.admin', icon: Shield, adminOnly: true },
];

function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-pulse-sky/30 bg-gradient-to-br from-pulse-cyan/20 to-pulse-violet/20">
        <span className="absolute inset-0 rounded-xl bg-pulse-cyan/20 blur-md transition group-hover:bg-pulse-cyan/30" />
        <Activity className="relative h-4 w-4 text-pulse-cyan" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-[15px] font-semibold tracking-tight text-white">
            PulseWard<span className="text-pulse-sky"> AI</span>
          </span>
          <span className="block text-[9px] font-medium uppercase tracking-[0.2em] text-ink-500">
            Smart City OS
          </span>
        </span>
      )}
    </Link>
  );
}

export function AppLayout() {
  const { profile, language, setLanguage, signOut, signIn } = useApp();
  const tr = (key: string) => translate(key, language);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileNav(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const visibleNav = NAV_ITEMS.filter((n) => !n.adminOnly || profile?.role === 'admin');

  return (
    <div className="relative flex min-h-screen">
      {/* Ambient background scene (desktop only, respects reduced motion inside) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] opacity-70">
        <Suspense fallback={null}>
          <CityScene variant="ambient" />
        </Suspense>
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-white/[0.06] bg-midnight-950/50 px-4 py-5 backdrop-blur-xl lg:flex">
        <Logo />
        <nav className="mt-7 flex-1 space-y-1">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500">
            {tr('app.workspace')}
          </p>
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => clsx('nav-link', isActive && 'nav-link-active')}
            >
              <item.icon className="h-4 w-4" />
              <span>{translate(item.labelKey, language)}</span>
              {item.adminOnly && (
                <span className="ml-auto rounded border border-pulse-violet/30 px-1 text-[9px] uppercase tracking-wider text-pulse-violet">
                  Admin
                </span>
              )}
            </NavLink>
          ))}
          <div className="my-3 h-px bg-white/[0.06]" />
          <button onClick={() => setAssistantOpen(true)} className="nav-link w-full text-left">
            <Sparkles className="h-4 w-4 text-pulse-violet" />
            <span>{translate('nav.assistant', language)}</span>
          </button>
          <Link to="/" className="nav-link">
            <Home className="h-4 w-4" />
            <span>{translate('nav.landing', language)}</span>
          </Link>
        </nav>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
          <div className="flex items-center gap-2 text-[11px] text-ink-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {tr('app.demoEnvironment')}
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-ink-500">
            {tr('app.reportsStayHere')}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-ink-500">
            <Bot className="h-3 w-3" />
            AI: {AI_BACKEND_CONFIGURED ? 'Gemini backend' : 'local demo analyzer'}
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-midnight-950/70 px-4 backdrop-blur-xl md:px-6">
          <button
            className="rounded-lg p-2 text-ink-300 transition hover:bg-white/[0.06] lg:hidden"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-ink-300 transition hover:text-white"
              title={tr('notice.toggleTitle')}
              aria-label={tr('notice.toggleTitle')}
            >
              <Languages className="h-3.5 w-3.5" />
              {language === 'en' ? 'EN' : 'தமிழ்'}
            </button>

            <button
              onClick={() => setAssistantOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-pulse-violet/25 bg-pulse-violet/10 text-pulse-violet transition hover:bg-pulse-violet/20"
              aria-label="Open AI assistant"
            >
              <Sparkles className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-pulse-cyan" />
            </button>

            {profile ? (
              <div className="flex items-center gap-2">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium text-ink-100">{profile.display_name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-ink-500">
                    {profile.role} · demo
                  </p>
                </div>
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-pulse-cyan/30 to-pulse-violet/30 font-display text-xs font-semibold text-white">
                  {profile.display_name.slice(0, 1)}
                </div>
                <button
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                  className="rounded-lg p-2 text-ink-400 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label={tr('app.signOut')}
                  title={tr('app.signOut')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button size="sm" variant="secondary" icon={<LogIn className="h-3.5 w-3.5" />} onClick={() => navigate('/signin')}>
                {tr('app.signIn')}
              </Button>
            )}
          </div>
        </header>

        <LanguageNotice />

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-white/[0.05] px-6 py-5 text-[11px] text-ink-500">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2">
            <span>PulseWard AI · hackathon demo build · AI estimates only</span>
            <span>Created by Vishwa S.</span>
            <span className="flex items-center gap-3">
              <a className="hover:text-ink-200" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
                © OpenStreetMap contributors
              </a>
              <span>© CARTO tiles</span>
            </span>
          </div>
        </footer>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNav && (
          <div className="fixed inset-0 z-[110] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-midnight-950/75 backdrop-blur-sm"
              onClick={() => setMobileNav(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="relative flex h-full w-[280px] flex-col border-r border-white/10 bg-midnight-900/98 p-4"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setMobileNav(false)}
                  className="rounded-lg p-2 text-ink-400 hover:text-white"
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="mt-6 space-y-1">
                {visibleNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/app'}
                    className={({ isActive }) => clsx('nav-link', isActive && 'nav-link-active')}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{translate(item.labelKey, language)}</span>
                  </NavLink>
                ))}
                <button onClick={() => { setMobileNav(false); setAssistantOpen(true); }} className="nav-link w-full text-left">
                  <Sparkles className="h-4 w-4 text-pulse-violet" />
                  <span>{translate('nav.assistant', language)}</span>
                </button>
              </nav>
              <div className="mt-auto space-y-2">
                {!profile && (
                  <>
                    <Button className="w-full" size="sm" onClick={() => { setMobileNav(false); signIn('citizen'); }}>
                      Continue as citizen (demo)
                    </Button>
                    <Button
                      className="w-full"
                      size="sm"
                      variant="secondary"
                      onClick={() => { setMobileNav(false); signIn('admin'); }}
                    >
                      Continue as admin (demo)
                    </Button>
                  </>
                )}
                <p className="text-[10px] leading-relaxed text-ink-500">
                  Demo mode · data stays in this browser
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}

export function FloatingAssistantButton() {
  const { language } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-pulse-violet/30 bg-midnight-850/90 px-4 py-2.5 text-xs font-medium text-white shadow-glow backdrop-blur-xl transition hover:border-pulse-cyan/40"
      >
        <span className="relative h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-pulse-cyan opacity-70" />
          <span className="relative block h-2 w-2 rounded-full bg-pulse-cyan" />
        </span>
        {translate('app.askPulseward', language)}
      </button>
      <AssistantPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
