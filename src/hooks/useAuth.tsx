import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { TERMS_VERSION } from '@/lib/privacy';
import { authApi, type ApiError, type AuthUser } from '@/lib/api';

interface AuthContext {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    redirectPath?: string | null,
  ) => Promise<{ error: ApiError | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: ApiError | null }>;
  signOut: () => Promise<void>;
  /** Recarrega a sessão (depois de login, confirmação de e-mail etc.) */
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await authApi.me();
    setUser(data?.user ?? null);
    setIsAdmin(!!data?.isAdmin);
    setIsLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const signUp = async (email: string, password: string, fullName: string, redirectPath?: string | null) => {
    const { data, error } = await authApi.signUp({
      email,
      password,
      full_name: fullName,
      // Registro do aceite dos Termos/Política (gravado em consent_records pelo banco)
      terms_version: TERMS_VERSION,
      age_confirmed: true,
      redirect: redirectPath ?? '/meu-perfil',
    });
    if (!error && !data?.needsConfirmation) await refresh();
    return { error, needsConfirmation: !!data?.needsConfirmation };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await authApi.signIn(email, password);
    if (!error) await refresh();
    return { error };
  };

  const signOut = async () => {
    await authApi.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthCtx.Provider value={{ user, isAdmin, isLoading, signUp, signIn, signOut, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
