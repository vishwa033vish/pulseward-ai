import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AppLayout } from './components/Layout';
import { Button, Panel, Spinner, ToastHost } from './components/ui';
import { useApp } from './store/AppStore';

const LandingPage = lazy(() => import('./pages/Landing').then((m) => ({ default: m.LandingPage })));
const SignInPage = lazy(() => import('./pages/SignIn').then((m) => ({ default: m.SignInPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const ScannerPage = lazy(() => import('./pages/Scanner').then((m) => ({ default: m.ScannerPage })));
const ComposerPage = lazy(() => import('./pages/Composer').then((m) => ({ default: m.ComposerPage })));
const CityMapPage = lazy(() => import('./pages/CityMap').then((m) => ({ default: m.CityMapPage })));
const TrackingPage = lazy(() => import('./pages/Tracking').then((m) => ({ default: m.TrackingPage })));
const TrackingDetailPage = lazy(() => import('./pages/TrackingDetail').then((m) => ({ default: m.TrackingDetailPage })));
const PriorityPage = lazy(() => import('./pages/Priority').then((m) => ({ default: m.PriorityPage })));
const AdminPage = lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminPage })));
const AssistantPage = lazy(() => import('./pages/AssistantPage').then((m) => ({ default: m.AssistantPage })));
const NotFoundPage = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFoundPage })));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner label="Loading interface…" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

/** Protected admin route: demo role-based access control. */
function AdminGate({ children }: { children: React.ReactNode }) {
  const { profile, signIn } = useApp();
  const navigate = useNavigate();

  if (profile?.role === 'admin') return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Panel className="max-w-md text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-pulse-violet/25 bg-pulse-violet/10 text-pulse-violet">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-white">Administrator access required</h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-400">
          The command center is restricted to the admin role. In this demo, switch to the demo administrator account to
          explore triage, assignments and analytics.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            onClick={() => {
              signIn('admin');
              navigate('/app/admin');
            }}
          >
            Continue as demo admin
          </Button>
          {profile ? (
            <p className="text-[10.5px] text-ink-500">
              Currently signed in as {profile.display_name} ({profile.role}).
            </p>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/signin?next=/app/admin')}>
              Open demo sign in
            </Button>
          )}
        </div>
        <p className="mt-4 text-[10px] leading-relaxed text-ink-600">
          Production note: this gate mirrors an RLS policy + role claim check; the demo version is client-side only.
        </p>
      </Panel>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="scan" element={<ScannerPage />} />
            <Route path="report/new" element={<ComposerPage />} />
            <Route path="map" element={<CityMapPage />} />
            <Route path="tracking" element={<TrackingPage />} />
            <Route path="tracking/:id" element={<TrackingDetailPage />} />
            <Route path="priority" element={<PriorityPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route
              path="admin"
              element={
                <AdminGate>
                  <AdminPage />
                </AdminGate>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ToastHost />
    </>
  );
}
