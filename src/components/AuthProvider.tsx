import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '../lib/http';
import { getMe, login as loginRequest, logout as logoutRequest } from '../lib/api';

type AuthState = {
  ready: boolean;
  admin: { name: string } | null;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState<{ name: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((result) => {
        if (!cancelled) setAdmin(result.admin);
      })
      .catch((error: unknown) => {
        if (!cancelled && !(error instanceof ApiError && error.status === 401)) {
          console.error(error);
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      admin,
      login: async (password: string) => {
        const result = await loginRequest(password);
        setAdmin(result.admin);
      },
      logout: async () => {
        await logoutRequest();
        setAdmin(null);
      },
    }),
    [admin, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
