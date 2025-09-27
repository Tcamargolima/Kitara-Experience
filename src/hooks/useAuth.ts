import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  profile: 'admin' | 'cliente';
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for special user in localStorage
  useEffect(() => {
    console.log("🔍 Checking for special user in localStorage");
    const specialUser = localStorage.getItem("specialUser");
    if (specialUser) {
      console.log("✅ Special user found:", specialUser);
      const userData = JSON.parse(specialUser);
      
      // Create a mock user object for special users
      const mockUser = {
        id: userData.id,
        email: userData.email || `${userData.id}@special.local`,
        aud: "authenticated",
        role: "authenticated",
        email_confirmed_at: new Date().toISOString(),
        phone: userData.phone || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { special_access: true }
      };
      
      setUser(mockUser as any);
      setProfile({
        id: userData.id,
        user_id: userData.id,
        name: userData.name,
        phone: userData.phone,
        profile: userData.profile || 'cliente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      console.log("🎯 Loading set to false for special user, created mockUser:", !!mockUser);
      return;
    } else {
      console.log("❌ No special user found in localStorage");
    }
  }, []);

  useEffect(() => {
    console.log("🚀 Setting up Supabase auth listener");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, !!session);

        // Check for special user first and avoid overwriting mock auth state
        const specialUser = localStorage.getItem("specialUser");
        if (specialUser) {
          console.log("👑 Special user detected in auth listener, preserving mock user");
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("📝 Fetching profile for user:", session.user.id);
          // Defer profile fetching to avoid deadlocks
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            console.log("👤 Profile data:", profileData);
            setProfile(profileData as Profile);
            setLoading(false);
          }, 0);
        } else {
          console.log("🚪 No session, clearing profile");
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🔍 Initial session check:", !!session);
      
      // Check for special user first
      const specialUser = localStorage.getItem("specialUser");
      if (specialUser) {
        console.log("👑 Special user exists, skipping session logic");
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log("📝 Fetching initial profile for user:", session.user.id);
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          console.log("👤 Initial profile data:", profileData);
          setProfile(profileData as Profile);
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
      // Clear special user
      localStorage.removeItem("specialUser");
      
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Navigate to auth page
      navigate('/auth');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Force cleanup even if signOut fails
      localStorage.removeItem("specialUser");
      setUser(null);
      setSession(null);
      setProfile(null);
      navigate('/auth');
    }
  };

  const isAuthenticated = !!user || !!profile;
  const isAdmin = profile?.profile === 'admin';

  return {
    user,
    profile,
    session,
    loading,
    signIn,
    sendSmsCode,
    verifyPhone,
    signInWithPhone,
    signOut,
    isAuthenticated,
    isAdmin
  };
};