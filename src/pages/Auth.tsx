import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import AuthStepper from "@/components/auth/AuthStepper";
import { InviteCodeStep } from "@/components/auth/InviteCodeStep";
import { SignUpStep } from "@/components/auth/SignUpStep";
import { LoginStep } from "@/components/auth/LoginStep";
import { MFASetupStep } from "@/components/auth/MFASetupStep";
import { MFAVerifyStep } from "@/components/auth/MFAVerifyStep";

const Auth = () => {
  const {
    user, loading, authStep, inviteCode, isAuthenticated,
    signIn, signUp, signOut, setValidatedInvite, goToLogin,
    completeMfaSetup, completeMfaVerify,
  } = useSecureAuth();

  const navigate = useNavigate();
  const [animKey, setAnimKey] = useState(0);

  // Re-trigger animation on step change
  useEffect(() => { setAnimKey((k) => k + 1); }, [authStep]);

  useEffect(() => {
    if (isAuthenticated && !loading) navigate("/dashboard");
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen kitara-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto mb-4" />
          <p className="text-primary">Carregando...</p>
        </div>
      </div>
    );
  }

  const renderAuthStep = () => {
    switch (authStep) {
      case "invite":
        return <InviteCodeStep onValidInvite={setValidatedInvite} onLoginClick={goToLogin} />;
      case "signup":
        return <SignUpStep inviteCode={inviteCode || ""} onSignUp={signUp} onBackToInvite={() => window.location.reload()} />;
      case "login":
        return <LoginStep onSignIn={signIn} onBackToInvite={() => window.location.reload()} />;
      case "mfa_setup":
        return <MFASetupStep userEmail={user?.email || ""} onComplete={completeMfaSetup} />;
      case "mfa_verify":
        return <MFAVerifyStep onComplete={completeMfaVerify} onSignOut={signOut} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen kitara-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/kitara/assets/logo.png" alt="KITARA logo" className="h-20 w-20 drop-shadow-[0_0_20px_rgba(197,160,89,0.2)]" />
          </div>
          <h1 className="kitara-title text-4xl font-cinzel">KITARA</h1>
        </div>

        {/* Stepper */}
        <AuthStepper currentStep={authStep} />

        {/* Current auth step with animation */}
        <div key={animKey} className="animate-fade-in">
          {renderAuthStep()}
        </div>
      </div>
    </div>
  );
};

export default Auth;
