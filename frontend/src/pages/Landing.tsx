import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
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
import { LanguageNotice } from '../components/LanguageNotice';
import { translate } from '../lib/i18n';
import '../styles/landing.css';

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
      <p className="lp-stat-value">
        {n.toLocaleString('en-IN')}
        <em>{suffix}</em>
      </p>
      <p className="lp-stat-label">{label}</p>
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
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const HOW_IT_WORKS = [
  { icon: ScanLine, titleKey: 'landing.step1.title', bodyKey: 'landing.step1.body' },
  { icon: BrainCircuit, titleKey: 'landing.step2.title', bodyKey: 'landing.step2.body' },
  { icon: Gauge, titleKey: 'landing.step3.title', bodyKey: 'landing.step3.body' },
  { icon: MapPin, titleKey: 'landing.step4.title', bodyKey: 'landing.step4.body' },
];

const FEATURES = [
  { icon: BrainCircuit, titleKey: 'landing.feat1.title', bodyKey: 'landing.feat1.body' },
  { icon: Radar, titleKey: 'landing.feat2.title', bodyKey: 'landing.feat2.body' },
  { icon: Layers, titleKey: 'landing.feat3.title', bodyKey: 'landing.feat3.body' },
  { icon: FileSearch, titleKey: 'landing.feat4.title', bodyKey: 'landing.feat4.body' },
  { icon: Users, titleKey: 'landing.feat5.title', bodyKey: 'landing.feat5.body' },
  { icon: Globe2, titleKey: 'landing.feat6.title', bodyKey: 'landing.feat6.body' },
];

export function LandingPage() {
  const { profile, language, setLanguage, signIn } = useApp();
  const tr = (key: string) => translate(key, language);
  useDocumentTitle(tr('landing.heroHeadline'));
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });

  return (
    <div className="lp">
      {/* NAV */}
      <header className="lp-header">
        <div className="lp-wrap lp-header-inner">
          <Link to="/" className="lp-brand">
            PulseWard AI
          </Link>

          <nav className="lp-nav">
            <a href="#how">{tr('landing.navHow')}</a>
            <a href="#features">{tr('landing.navFeatures')}</a>
            <a href="#impact">{tr('landing.navImpact')}</a>
            <Link to="/app/map">{tr('landing.navMap')}</Link>
          </nav>

          <div className="lp-header-actions">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              title={tr('notice.toggleTitle')}
              aria-label={tr('notice.toggleTitle')}
              className="lp-lang"
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>
            <Link to={profile ? '/app' : '/signin'} className="lp-btn ghost sm lp-wide-only">
              {profile ? tr('landing.openDashboard') : tr('app.signIn')}
            </Link>
            <Link to="/app/scan" aria-label={tr('app.report')} className="lp-btn sm">
              <ScanLine className="h-3.5 w-3.5" />
              <span className="lp-wide-only">{tr('app.report')}</span>
            </Link>
          </div>
        </div>
      </header>
      <LanguageNotice floating />

      <main className="lp-main">
        {/* HERO */}
        <section className="lp-hero">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="lp-eyebrow">
              <Sparkles className="h-3 w-3" /> {tr('landing.badge')}
            </span>

            <h1>
              {language === 'ta' ? (
                <>
                  புத்திசாலி நகரங்களை
                  <br />
                  உருவாக்குவோம். <span className="grad">ஒன்றாக.</span>
                </>
              ) : (
                <>
                  Building Smarter
                  <br />
                  Cities. <span className="grad">Together.</span>
                </>
              )}
            </h1>

            <p className="lp-lede">{tr('landing.heroSub')}</p>

            <div className="lp-actions">
              <Link to="/app/scan" className="lp-btn">
                <ScanLine className="h-4 w-4" />
                {tr('app.report')}
              </Link>
              <Link to="/app" className="lp-btn ghost">
                <MapPin className="h-4 w-4" />
                {tr('app.explore')}
              </Link>
            </div>

            <div className="lp-micro">
              <span>
                <ShieldCheck className="h-3 w-3" /> {tr('landing.noKeys')}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <Globe2 className="h-3 w-3" /> English / தமிழ்
              </span>
              <span aria-hidden="true">·</span>
              <button onClick={() => signIn('citizen')}>{tr('landing.tryCitizen')}</button>
            </div>

            <dl className="lp-hero-meta">
              <div>
                <dt>{tr('landing.metaBuilt')}</dt>
                <dd>Vishwa S.</dd>
              </div>
              <div>
                <dt>{tr('landing.metaStack')}</dt>
                <dd>React · FastAPI · Gemini</dd>
              </div>
              <div>
                <dt>{tr('landing.metaData')}</dt>
                <dd>{tr('landing.metaDataValue')}</dd>
              </div>
            </dl>

            <a href="#stats" className="lp-cue">
              {tr('landing.explore')}
              <ChevronDown className="h-4 w-4 animate-floaty" />
            </a>
          </motion.div>
        </section>

        {/* STATS */}
        <section id="stats" ref={statsRef} className="lp-stats">
          <Stat value={1284} suffix="+" label={tr('landing.stat1')} start={statsInView} />
          <Stat value={946} suffix="" label={tr('landing.stat2')} start={statsInView} />
          <Stat value={6} suffix="" label={tr('landing.stat3')} start={statsInView} />
          <Stat value={18} suffix="h" label={tr('landing.stat4')} start={statsInView} />
          <p className="lp-stats-note">{tr('landing.statsNote')}</p>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="lp-section">
          <Reveal>
            <div className="lp-sec-head">
              <span className="lp-sec-num">01</span>
              <h2>{tr('landing.navHow')}</h2>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="lp-sec-sub">{tr('landing.howSub')}</p>
            <div className="lp-grid">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.titleKey} className="lp-card">
                  <div className="lp-card-top">
                    <span className="lp-icon">
                      <step.icon className="h-4 w-4" />
                    </span>
                    <span className="lp-card-index">0{i + 1}</span>
                  </div>
                  <h3>{tr(step.titleKey)}</h3>
                  <p>{tr(step.bodyKey)}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* FEATURES */}
        <section id="features" className="lp-section">
          <Reveal>
            <div className="lp-sec-head alt">
              <span className="lp-sec-num">02</span>
              <h2>{tr('landing.featuresEyebrow')}</h2>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="lp-sec-sub">{tr('landing.featuresTitle')}</p>
            <div className="lp-grid three">
              {FEATURES.map((f, i) => (
                <div key={f.titleKey} className="lp-card">
                  <div className="lp-card-top">
                    <span className="lp-icon">
                      <f.icon className="h-4 w-4" />
                    </span>
                    <span className="lp-card-index">0{i + 1}</span>
                  </div>
                  <h3>{tr(f.titleKey)}</h3>
                  <p>{tr(f.bodyKey)}</p>
                </div>
              ))}
            </div>
            <p className="mt-5">
              <Link to="/app" className="lp-micro" style={{ color: 'var(--lp-green)' }}>
                {tr('landing.seeLive')}
              </Link>
            </p>
          </Reveal>
        </section>

        {/* IMPACT */}
        <section id="impact" className="lp-section">
          <Reveal>
            <div className="lp-sec-head">
              <span className="lp-sec-num">03</span>
              <h2>{tr('landing.impactEyebrow')}</h2>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="lp-lead">{tr('landing.impactTitle')}</p>
            <p className="lp-sec-sub">{tr('landing.impactBody')}</p>

            <div className="lp-impact-rows">
              {[
                { icon: ClipboardCheck, k: 'landing.impact1.k', v: 'landing.impact1.v' },
                { icon: Radar, k: 'landing.impact2.k', v: 'landing.impact2.v' },
                { icon: ShieldCheck, k: 'landing.impact3.k', v: 'landing.impact3.v' },
                { icon: Zap, k: 'landing.impact4.k', v: 'landing.impact4.v' },
              ].map((item) => (
                <div key={item.k} className="lp-impact-row">
                  <span className="lp-icon">
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <strong>{tr(item.k)}</strong>
                    <small>{tr(item.v)}</small>
                  </span>
                </div>
              ))}
            </div>

            <div className="lp-panel mt-10">
              <p className="lp-panel-title">{tr('landing.panelTitle')}</p>
              <p className="lp-panel-figure">
                6.4<em>×</em>
              </p>
              <p className="lp-panel-note">
                {tr('landing.panelBody')} — <span>{tr('landing.panelNote')}</span>
              </p>

              <div className="lp-bars">
                {[
                  { labelKey: 'landing.barRoad', pct: 82, color: '#ff3b3b' },
                  { labelKey: 'landing.barDrainage', pct: 64, color: '#00e08a' },
                  { labelKey: 'landing.barGarbage', pct: 48, color: '#4da3ff' },
                  { labelKey: 'landing.barStreetlights', pct: 36, color: '#ffb0b0' },
                ].map((row) => (
                  <div key={row.labelKey}>
                    <div className="lp-bar-label">
                      <span>{tr(row.labelKey)}</span>
                      <span>{row.pct}%</span>
                    </div>
                    <div className="lp-bar-track">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="lp-bar-fill"
                        style={{ background: row.color, opacity: 0.85 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="lp-disclaimer">{tr('landing.panelDisclaimer')}</div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-main">
          <h2>
            {tr('landing.ctaTitle1')}
            <em>{tr('landing.ctaTitle2')}</em>
          </h2>
          <p>{tr('landing.ctaBody')}</p>
          <div className="lp-actions">
            <Link to="/app/scan" className="lp-btn">
              <ScanLine className="h-4 w-4" />
              {tr('landing.ctaScanner')}
            </Link>
            <Link to="/signin" className="lp-btn ghost">
              <ArrowRight className="h-4 w-4" />
              {tr('landing.ctaAccounts')}
            </Link>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <div>
            <Link to="/" className="lp-brand">
              PulseWard AI
            </Link>
            <p className="lp-footer-note">{tr('landing.footerNote')}</p>
            <p className="lp-footer-credit">{tr('landing.footerCredit')}</p>
          </div>
          <div className="lp-footer-links">
            <Link to="/app">{tr('nav.dashboard')}</Link>
            <Link to="/app/map">{tr('nav.map')}</Link>
            <Link to="/app/priority">{tr('nav.priority')}</Link>
            <Link to="/app/admin">{tr('landing.footerAdmin')}</Link>
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              {tr('landing.footerMapData')}
            </a>
          </div>
        </div>
      </footer>
      <FloatingAssistantButton />
    </div>
  );
}
