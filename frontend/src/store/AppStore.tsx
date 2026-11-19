import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Department, Draft, Language, Profile, Report, Role, Status } from '../types';
import { SAMPLE_REPORTS } from '../lib/demoData';
import { CATEGORY_MAP } from '../lib/categories';

const STORAGE = {
  reports: 'pulseward.reports.v1',
  profile: 'pulseward.profile.v1',
  language: 'pulseward.language.v1',
  draft: 'pulseward.draft.v1',
};

const DEMO_USERS: Record<Role, Profile> = {
  citizen: {
    id: 'demo-citizen',
    display_name: 'Aarav Raj',
    preferred_language: 'en',
    role: 'citizen',
    created_at: new Date().toISOString(),
    is_demo: true,
  },
  admin: {
    id: 'demo-admin',
    display_name: 'Priya Menon',
    preferred_language: 'en',
    role: 'admin',
    created_at: new Date().toISOString(),
    is_demo: true,
  },
};

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: 'success' | 'error' | 'info';
}

interface AppState {
  reports: Report[];
  profile: Profile | null;
  language: Language;
  toasts: Toast[];
  draft: Draft | null;
  signIn: (role: Role) => void;
  signOut: () => void;
  setLanguage: (lang: Language) => void;
  addReport: (report: Report) => void;
  updateStatus: (id: string, status: Status, note?: string) => void;
  assignDepartment: (id: string, department: Department | null) => void;
  saveDraft: (draft: Draft | null) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  resetDemoData: () => void;
  updateProfileLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppState | null>(null);

function loadReports(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE.reports);
    if (!raw) return SAMPLE_REPORTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return SAMPLE_REPORTS;
    return parsed as Report[];
  } catch {
    return SAMPLE_REPORTS;
  }
}

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE.profile);
    if (!raw) return null;
    const p = JSON.parse(raw) as Profile;
    if (!p || (p.role !== 'citizen' && p.role !== 'admin')) return null;
    return p;
  } catch {
    return null;
  }
}

function loadLanguage(): Language {
  const stored = localStorage.getItem(STORAGE.language);
  return stored === 'ta' ? 'ta' : 'en';
}

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(STORAGE.draft);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>(loadReports);
  const [profile, setProfile] = useState<Profile | null>(loadProfile);
  const [language, setLanguageState] = useState<Language>(loadLanguage);
  const [draft, setDraft] = useState<Draft | null>(loadDraft);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.reports, JSON.stringify(reports));
    } catch {
      // Quota exceeded (large images) — reports still work for this session.
    }
  }, [reports]);

  useEffect(() => {
    try {
      if (profile) localStorage.setItem(STORAGE.profile, JSON.stringify(profile));
      else localStorage.removeItem(STORAGE.profile);
    } catch {
      /* ignore */
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE.language, language);
    document.documentElement.lang = language === 'ta' ? 'ta' : 'en';
  }, [language]);

  useEffect(() => {
    try {
      if (draft) localStorage.setItem(STORAGE.draft, JSON.stringify(draft));
      else localStorage.removeItem(STORAGE.draft);
    } catch {
      /* ignore */
    }
  }, [draft]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), 5200);
    },
    [dismissToast],
  );

  const signIn = useCallback(
    (role: Role) => {
      const base = DEMO_USERS[role];
      const next = { ...base, preferred_language: language };
      setProfile(next);
      pushToast({
        tone: 'success',
        title: `Signed in as ${next.display_name}`,
        description:
          role === 'admin'
            ? 'Demo administrator — all admin actions are simulated.'
            : 'Demo citizen account stored locally in this browser.',
      });
    },
    [language, pushToast],
  );

  const signOut = useCallback(() => {
    setProfile(null);
    pushToast({ tone: 'info', title: 'Signed out of the demo session' });
  }, [pushToast]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setProfile((prev) => (prev ? { ...prev, preferred_language: lang } : prev));
  }, []);

  const updateProfileLanguage = useCallback((lang: Language) => setLanguage(lang), [setLanguage]);

  const addReport = useCallback((report: Report) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const updateStatus = useCallback((id: string, status: Status, note?: string) => {
    const at = new Date().toISOString();
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              updated_at: at,
              status_history: [...r.status_history, { status, at, note: note ?? 'Demo status update' }],
            }
          : r,
      ),
    );
  }, []);

  const assignDepartment = useCallback((id: string, department: Department | null) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              department: department?.department_name ?? null,
              updated_at: new Date().toISOString(),
            }
          : r,
      ),
    );
  }, []);

  const saveDraft = useCallback((next: Draft | null) => setDraft(next), []);

  const resetDemoData = useCallback(() => {
    setReports(SAMPLE_REPORTS);
    setDraft(null);
    pushToast({ tone: 'info', title: 'Demo dataset restored', description: '14 sample reports reloaded.' });
  }, [pushToast]);

  const value = useMemo<AppState>(
    () => ({
      reports,
      profile,
      language,
      toasts,
      draft,
      signIn,
      signOut,
      setLanguage,
      addReport,
      updateStatus,
      assignDepartment,
      saveDraft,
      pushToast,
      dismissToast,
      resetDemoData,
      updateProfileLanguage,
    }),
    [
      reports,
      profile,
      language,
      toasts,
      draft,
      signIn,
      signOut,
      setLanguage,
      addReport,
      updateStatus,
      assignDepartment,
      saveDraft,
      pushToast,
      dismissToast,
      resetDemoData,
      updateProfileLanguage,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function useCategoryLabel() {
  const { language } = useApp();
  return useCallback(
    (id: keyof typeof CATEGORY_MAP) => {
      const meta = CATEGORY_MAP[id];
      return language === 'ta' ? meta.labelTa : meta.label;
    },
    [language],
  );
}
