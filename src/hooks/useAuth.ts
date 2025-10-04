import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = 'admin' | 'cliente' | 'pendente';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  profile: 'admin' | 'cliente';
  created_at: string;
  updated_at: string;
  pending_approval?: boolean;
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
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, !!session);

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("📝 Fetching profile and role for user:", session.user.id);
          // Defer profile and role fetching to avoid deadlocks
          setTimeout(async () => {
          const [profileResult, roleResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single(),
            supabase
              .from('user_roles' as any)
              .select('role')
              .eq('user_id', session.user.id)
              .single()
          ]);
            
            console.log("👤 Profile data:", profileResult.data);
            console.log("🔐 Role data:", roleResult.data);
            setProfile(profileResult.data as Profile);
            // @ts-ignore - role property will exist after migration
            setUserRole(roleResult.data?.role ?? null);
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

    // THEN check for existing session
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
              .eq('user_id', session.user.id)
              .single(),
            supabase
              .from('user_roles' as any)
              .select('role')
              .eq('user_id', session.user.id)
              .single()
          ]);
          
          console.log("👤 Initial profile data:", profileResult.data);
          console.log("🔐 Initial role data:", roleResult.data);
          setProfile(profileResult.data as Profile);
          // @ts-ignore - role property will exist after migration
          setUserRole(roleResult.data?.role ?? null);
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: "Falha no login" };
    } catch (error) {
      return { success: false, error: "Erro inesperado" };
    } finally {
      setLoading(false);
    }
  };

  const sendSmsCode = async (phone: string): Promise<{ success: boolean; error?: string; code?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { phone }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, code: data?.code };
    } catch (error) {
      return { success: false, error: "Erro ao enviar SMS" };
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async (phone: string, code: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Check for special access code first
      if (code === "123123") {
        // Create user with email (using phone as email base) for special access
        const email = `${phone.replace(/\D/g, '')}@gatepass.temp`;
        const password = `temp_${Date.now()}`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
              device_fingerprint: navigator.userAgent,
              special_access: true
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      }
      
      // Verify SMS code first
      const { data: smsData, error: smsError } = await supabase
        .from('sms_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (smsError || !smsData) {
        return { success: false, error: "Código SMS inválido ou expirado" };
      }

      // Mark SMS code as verified
      await supabase
        .from('sms_codes')
        .update({ verified: true })
        .eq('id', smsData.id);

      // Create user with phone authentication
      const { data, error } = await supabase.auth.signUp({
        phone,
        password: `temp_${Date.now()}`, // Temporary password for phone auth
        options: {
          data: {
            name,
            phone,
            device_fingerprint: navigator.userAgent
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro na verificação" };
    } finally {
      setLoading(false);
    }
  };

  const signInWithPhone = async (phone: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Check for special access code first
      if (code === "123123") {
        // Find existing user with this phone in profiles
        const { data: existingProfiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', phone)
          .limit(1);

        if (existingProfiles && existingProfiles.length > 0) {
          // Create email from phone for login
          const email = `${phone.replace(/\D/g, '')}@gatepass.temp`;
          const password = `temp_${Date.now()}`;
          
          // Sign in with the email
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          // If password doesn't work, try to update it
          if (error && error.message.includes('Invalid login credentials')) {
            // Try to sign up again to refresh the password
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  name: existingProfiles[0].name,
                  phone,
                  device_fingerprint: navigator.userAgent,
                  special_access: true
                }
              }
            });

            if (signUpError) {
              return { success: false, error: signUpError.message };
            }
          } else if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } else {
          return { success: false, error: "Usuário não encontrado. Use o código especial no cadastro primeiro." };
        }
      }
      
      // Verify SMS code
      const { data: smsData, error: smsError } = await supabase
        .from('sms_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (smsError || !smsData) {
        return { success: false, error: "Código SMS inválido ou expirado" };
      }

      // Mark SMS code as verified
      await supabase
        .from('sms_codes')
        .update({ verified: true })
        .eq('id', smsData.id);

      // Sign in with phone using OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          data: {
            device_fingerprint: navigator.userAgent
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro no login" };
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
  const isPending = userRole === 'pendente';
  const isCliente = userRole === 'cliente';

  return {
    user,
    profile,
    session,
    loading,
    userRole,
    signIn,
    sendSmsCode,
    verifyPhone,
    signInWithPhone,
    signOut,
    hasRole,
    isAuthenticated,
    isAdmin,
    isPending,
    isCliente,
  };
};