import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Sparkles } from "lucide-react";

// Auth step components
import { InviteCodeStep } from "@/components/auth/InviteCodeStep";
import { SignUpStep } from "@/components/auth/SignUpStep";
import { LoginStep } from "@/components/auth/LoginStep";
import { MFASetupStep } from "@/components/auth/MFASetupStep";
import { MFAVerifyStep } from "@/components/auth/MFAVerifyStep";

const Auth = () => {
  const {
    user,
    profile,
    loading,
    authStep,
    inviteCode,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    setValidatedInvite,
    goToLogin,
    completeMfaSetup,
    completeMfaVerify,
  } = useSecureAuth();

  const navigate = useNavigate();

  // Redirect to dashboard when fully authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen kitara-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Carregando...</p>
        </div>
      </div>
    );
  }

  const renderAuthStep = () => {
    switch (authStep) {
      case "invite":
        return (
          <InviteCodeStep
            onValidInvite={setValidatedInvite}
            onLoginClick={goToLogin}
          />
        );
      
      case "signup":
        return (
          <SignUpStep
            inviteCode={inviteCode || ""}
            onSignUp={signUp}
            onBackToInvite={() => window.location.reload()}
          />
        );
      
      case "login":
        return (
          <LoginStep
            onSignIn={signIn}
            onBackToInvite={() => window.location.reload()}
          />
        );
      
      case "mfa_setup":
        return (
          <MFASetupStep
            userEmail={user?.email || ""}
            onComplete={completeMfaSetup}
          />
        );
      
      case "mfa_verify":
        return (
          <MFAVerifyStep
            onComplete={completeMfaVerify}
            onSignOut={signOut}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen kitara-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src="/kitara/assets/logo.png"
                alt="KITARA logo"
                className="h-20 w-20 drop-shadow-lg"
              />
              <Sparkles className="h-6 w-6 text-secondary absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="kitara-title text-4xl font-cinzel">KITARA</h1>
        </div>

        {/* Current auth step */}
        {renderAuthStep()}
      </div>
    </div>
  );
};

export default Auth;
