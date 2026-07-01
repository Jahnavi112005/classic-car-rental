/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '../services/api';
import { AppUser, Profile, Session } from '../types';

type AuthContextType = {
  user: AppUser | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; profile?: Profile | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function hydrateSession() {
    try {
      const data = await authApi.me();
      setSession(data.session);
      setUser(data.session.user);
      setProfile(data.profile);
    } catch {
      authApi.logout();
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  }

  async function refreshProfile() {
    if (user) await hydrateSession();
  }

  useEffect(() => {
    hydrateSession().finally(() => setLoading(false));
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const data = await authApi.login({ email, password });
      setSession(data.session);
      setUser(data.session.user);
      setProfile(data.profile);
      return { error: null, profile: data.profile };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signOut() {
    authApi.logout();
    setSession(null);
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

