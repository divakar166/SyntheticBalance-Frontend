'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthSession,
  getFreshSession,
  readStoredSession,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from '@/lib/auth';

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const nextSession = await getFreshSession();
    setSession(nextSession);
    return nextSession;
  }, []);

  useEffect(() => {
    setSession(readStoredSession());
    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      signIn: async (email, password) => {
        const nextSession = await signInWithPassword(email, password);
        setSession(nextSession);
      },
      signUp: async (email, password) => {
        const nextSession = await signUpWithPassword(email, password);
        if (!nextSession) {
          return false;
        }
        setSession(nextSession);
        return true;
      },
      logout: async () => {
        await signOut(session);
        setSession(null);
        router.push('/login');
      },
      refreshSession,
    }),
    [isLoading, refreshSession, router, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.session) {
      router.replace('/login');
    }
  }, [auth.isLoading, auth.session, router]);

  return auth;
}
