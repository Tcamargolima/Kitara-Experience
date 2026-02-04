
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, logSecurityEvent, type UserProfile } from "@/lib/api";

export type AuthStep = "invite" | "login" | "signup" | "mfa_setup" | "mfa_verify" | "authenticated";

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  authStep: AuthStep;
  inviteCode: string | null;
}

export const useSecureAuth = () => {
  const [state, setState] = useState<SecureAuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    authStep: "invite",
    inviteCode: null,
  });
  
  const navigate = useNavigate();

  // Fetch profile using RPC
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const profile = await getMyProfile();
      return profile;
    } catch (error) {
      console.error("[SecureAuth] Error fetching profile:", error);
      return null;
    }
  }, []);

  // Determine auth step based on state
  // IMPORTANT: This is only called during initialization (page load/refresh)
  // NOT during active login flow - login flow manages its own state transitions
  const determineAuthStep = useCallback((
    session: Session | null,
    profile: UserProfile | null,
    isInitialLoad: boolean = false
  ): AuthStep => {
    if (!session) {
      return "invite"; // Start with invite code
    }
    
    if (!profile) {
      return "login"; // Session but no profile (edge case)
    }
    
    if (!profile.mfa_enabled) {
      return "mfa_setup"; // Must setup MFA
    }
    
    // If MFA is enabled and this is a fresh login (not page reload),
    // they need to verify MFA first
    // On page reload with existing session, assume MFA was already verified
    if (isInitialLoad) {
      // User refreshed page with valid session + MFA enabled = already authenticated
      return "authenticated";
    }
    
    // Fresh login with MFA enabled = needs verification
    return "mfa_verify";
  }, []);

  // Initialize auth state
  useEffect(() => {
    console.log("[SecureAuth] Initializing...");
    let isMounted = true;
    
    // Track if this is initial load vs active login
    let isInitialLoad = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[SecureAuth] Auth state changed:", event);
        
        // SIGNED_IN during active session means user just logged in
        // We DON'T want to override the authStep set by signIn()
        if (event === "SIGNED_IN" && !isInitialLoad) {
          // signIn() already set the correct authStep, don't override
          // Just update session/user if needed
          if (session?.user && isMounted) {
            setTimeout(async () => {
              const profile = await fetchProfile(session.user.id);
              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  user: session.user,
                  session,
                  profile,
                  loading: false,
                  // Keep the authStep that was set by signIn()
                }));
              }
              // Log security event
              await logSecurityEvent("login", true, { method: "password" });
            }, 0);
          }
          return;
        }
        
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            if (!isMounted) return;
            const profile = await fetchProfile(session.user.id);
            const step = determineAuthStep(session, profile, isInitialLoad);
            
            if (isMounted) {
              setState({
                user: session.user,
                session,
                profile,
                loading: false,
                authStep: step,
                inviteCode: null,
              });
            }
          }, 0);
        } else {
          if (isMounted) {
            setState({
              user: null,
              session: null,
              profile: null,
              loading: false,
              authStep: "invite",
              inviteCode: null,
            });
          }
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        const step = determineAuthStep(session, profile, true); // Always initial load here
        
        if (isMounted) {
          setState({
            user: session.user,
            session,
            profile,
            loading: false,
            authStep: step,
            inviteCode: null,
          });
        }
      } else {
        if (isMounted) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
      
      // After initial load, set flag to false
      isInitialLoad = false;
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, determineAuthStep]);

  // Set invite code after validation
  const setValidatedInvite = useCallback((code: string) => {
    setState((prev) => ({
      ...prev,
      inviteCode: code,
      authStep: "signup",
    }));
  }, []);

  // Move to login step (for returning users)
  const goToLogin = useCallback(() => {
    setState((prev) => ({
      ...prev,
      authStep: "login",
    }));
  }, []);

  // Sign in
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; needsMfa?: boolean; error?: string }> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await logSecurityEvent("login", false, { email, error: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        
        if (profile?.mfa_enabled) {
          // User has MFA enabled, they need to verify
          setState((prev) => ({
            ...prev,
            user: data.user,
            session: data.session,
            profile,
            loading: false,
            authStep: "mfa_verify",
          }));
          return { success: true, needsMfa: true };
        }
        
        // No MFA, redirect to setup
        setState((prev) => ({
          ...prev,
          user: data.user,
          session: data.session,
          profile,
          loading: false,
          authStep: profile ? "mfa_setup" : "authenticated",
        }));
        
        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("[SecureAuth] Sign in error:", error);
      return { success: false, error: "Unexpected error" };
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            invite_code: state.inviteCode,
          },
        },
      });

      if (error) {
        await logSecurityEvent("signup", false, { email, error: error.message });
        return { success: false, error: error.message };
      }

      // Note: User might need to confirm email depending on Supabase settings
      return { success: true };
    } catch (error) {
      console.error("[SecureAuth] Sign up error:", error);
      return { success: false, error: "Unexpected error" };
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Complete MFA setup
  const completeMfaSetup = useCallback(() => {
    setState((prev) => ({
      ...prev,
      authStep: "authenticated",
      profile: prev.profile ? { ...prev.profile, mfa_enabled: true } : null,
    }));
  }, []);

  // Complete MFA verification
  const completeMfaVerify = useCallback(() => {
    setState((prev) => ({
      ...prev,
      authStep: "authenticated",
    }));
  }, []);

  // Sign out
  const signOut = async () => {
    try {
      await logSecurityEvent("logout", true);
      await supabase.auth.signOut({ scope: "global" });
      
      setState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        authStep: "invite",
        inviteCode: null,
      });
      
      navigate("/auth");
    } catch (error) {
      console.error("[SecureAuth] Sign out error:", error);
      // Force clear state anyway
      setState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        authStep: "invite",
        inviteCode: null,
      });
      navigate("/auth");
    }
  };

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState((prev) => ({ ...prev, profile }));
    }
  }, [state.user, fetchProfile]);

  // Computed properties
  const isAuthenticated = state.authStep === "authenticated";
  const isAdmin = state.profile?.role === "admin";
  const isClient = state.profile?.role === "client";
  const requiresMfa = state.authStep === "mfa_setup" || state.authStep === "mfa_verify";

  return {
    // State
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    authStep: state.authStep,
    inviteCode: state.inviteCode,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isClient,
    requiresMfa,
    
    // Actions
    signIn,
    signUp,
    signOut,
    setValidatedInvite,
    goToLogin,
    completeMfaSetup,
    completeMfaVerify,
    refreshProfile,
  };
};
