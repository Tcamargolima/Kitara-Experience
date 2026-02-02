import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = 'admin' | 'client';

interface Profile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserRole {
  role: AppRole;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🚀 Setting up Supabase auth listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, !!session);

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("📝 Fetching profile and role for user:", session.user.id);
          setTimeout(async () => {
            const [profileResult, roleResult] = await Promise.all([
              supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single(),
              supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single()
            ]);
              
            console.log("👤 Profile data:", profileResult.data);
            console.log("🔐 Role data:", roleResult.data);
            setProfile(profileResult.data as Profile | null);
            setUserRole((roleResult.data as UserRole | null)?.role ?? null);
            setLoading(false);
          }, 0);
        } else {
          console.log("🚪 No session, clearing profile and role");
          setProfile(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🔍 Initial session check:", !!session);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log("📝 Fetching initial profile and role for user:", session.user.id);
        setTimeout(async () => {
          const [profileResult, roleResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single(),
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single()
          ]);
          
          console.log("👤 Initial profile data:", profileResult.data);
          console.log("🔐 Initial role data:", roleResult.data);
          setProfile(profileResult.data as Profile | null);
          setUserRole((roleResult.data as UserRole | null)?.role ?? null);
          setLoading(false);
        }, 0);
      } else {
        console.log("❌ No initial session, setting loading to false");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      console.log('🔑 Tentando login com:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Login bem-sucedido:', data.user.email);
        return { success: true };
      }

      console.error('❌ Falha no login - usuário não encontrado');
      return { success: false, error: "Falha no login" };
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      return { success: false, error: "Erro inesperado" };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro no cadastro" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      navigate('/auth');
    } catch (error) {
      console.error('Erro no logout:', error);
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      navigate('/auth');
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return userRole === role;
  };

  const isAuthenticated = !!user;
  const isAdmin = userRole === 'admin';
  const isClient = userRole === 'client';

  return {
    user,
    profile,
    session,
    loading,
    userRole,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAuthenticated,
    isAdmin,
    isClient,
  };
};
