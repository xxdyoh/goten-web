'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, Building2 } from 'lucide-react';
import { authService, AuthCheckResult } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AppShellContextValue {
  user: NonNullable<AuthCheckResult['user']>;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppUser() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error('useAppUser dipakai di dalam AppShell');
  return ctx.user;
}

export default function AppShell({
  title,
  backTo = '/dashboard',
  right,
  children,
}: {
  title: string;
  backTo?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<NonNullable<AuthCheckResult['user']> | null>(null);

  useEffect(() => {
    authService.checkAuth().then((res) => {
      if (!res.authenticated || !res.user) {
        router.push('/login');
        return;
      }
      setUser(res.user);
    });
  }, [router]);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppShellContext.Provider value={{ user }}>
      <div className="min-h-screen bg-bg">
        <header className="bg-primary-600 text-white sticky top-0 z-20 shadow-soft">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center gap-3">
            <button
              onClick={() => router.push(backTo)}
              className="p-2 -m-1 rounded-md text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold truncate leading-tight">{title}</h1>
              <p className="text-xs text-white/70 truncate">{user.kar_nama}</p>
            </div>
            {right}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 text-white hover:bg-white/25"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Keluar</span>
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 sm:px-6 pb-8 pt-2 flex items-center gap-1.5 text-xs text-ink-soft">
          <Building2 className="w-3.5 h-3.5" />
          GOTEN, PT Bumi Sarana Maju
        </footer>
      </div>
    </AppShellContext.Provider>
  );
}