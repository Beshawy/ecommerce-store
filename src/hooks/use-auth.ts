import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const checkingRole = useRef(false);

  const checkRoles = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }
    if (checkingRole.current) return;
    checkingRole.current = true;
    try {
      const [adminRes, superRes] = await Promise.all([
        supabase.rpc('has_role', { _user_id: currentUser.id, _role: 'admin' }),
        supabase.rpc('has_role', { _user_id: currentUser.id, _role: 'super_admin' as any }),
      ]);
      setIsAdmin(!!adminRes.data || !!superRes.data);
      setIsSuperAdmin(!!superRes.data);
    } catch {
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      checkingRole.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkRoles(currentUser);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkRoles(currentUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, isAdmin, isSuperAdmin, loading, signIn, signUp, signOut };
};
