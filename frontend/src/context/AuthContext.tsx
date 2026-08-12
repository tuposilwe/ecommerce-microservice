import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TOKEN_STORAGE_KEY, setUnauthorizedHandler } from '../api/client';
import { decodeAuthToken } from '../lib/jwt';
import * as authApi from '../api/auth';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      const decoded = decodeAuthToken(token);
      if (decoded) {
        setUser(decoded);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      async login(email, password) {
        const token = await authApi.login({ email, password });
        const decoded = decodeAuthToken(token);
        if (!decoded) {
          throw new Error('Received an invalid token');
        }
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        setUser(decoded);
      },
      async register(name, email, password) {
        await authApi.register({ name, email, password });
        const token = await authApi.login({ email, password });
        const decoded = decodeAuthToken(token);
        if (!decoded) {
          throw new Error('Received an invalid token');
        }
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        setUser(decoded);
      },
      logout() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
