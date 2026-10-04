import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isBackendConfigured, supabase } from '@/data/supabase';

export interface AuthResult { ok: boolean; message?: string }

export const authService = {
  available: isBackendConfigured,
  async signUp(email: string, password: string): Promise<AuthResult> {
    if (!supabase) return { ok: false, message: 'Cloud accounts are not configured. Plink is running locally.' };
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? { ok: false, message: error.message } : { ok: true };
  },
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!supabase) return { ok: false, message: 'Cloud accounts are not configured. Plink is running locally.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { ok: false, message: error.message } : { ok: true };
  },
  async signOut() { await supabase?.auth.signOut(); },
};

export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}
