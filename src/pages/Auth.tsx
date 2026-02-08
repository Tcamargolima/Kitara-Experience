import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Sparkles, ArrowLeft } from "lucide-react";
import AuthStepper from "@/components/auth/AuthStepper";

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
    const stepProps = {
      className: "animate-fade-in animate-slide-up"
    };
    switch (authStep) {
      case "invite":
        return (
          <div {...stepProps}>
            <InviteCodeStep
              onValidInvite={setValidatedInvite}
              onLoginClick={goToLogin}
            />
          </div>
        );
      case "signup":
        return (
          <div {...stepProps}>
            <BackButton onClick={() => window.location.reload()} />
            <SignUpStep
              inviteCode={inviteCode || ""}
              onSignUp={signUp}
              onBackToInvite={() => window.location.reload()}
            />
          </div>
        );
      case "login":
        return (
          <div {...stepProps}>
            <BackButton onClick={() => window.location.reload()} />
            <LoginStep
              onSignIn={signIn}
              onBackToInvite={() => window.location.reload()}
            />
          </div>
        );
      case "mfa_setup":
        return (
          <div {...stepProps}>
            <BackButton onClick={() => goToLogin()} />
            <MFASetupStep
              userEmail={user?.email || ""}
              onComplete={completeMfaSetup}
            />
          </div>
        );
      case "mfa_verify":
        return (
          <div {...stepProps}>
            <BackButton onClick={() => goToLogin()} />
            <MFAVerifyStep
              onComplete={completeMfaVerify}
              onSignOut={signOut}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Consistent back button except for invite
  function BackButton({ onClick }: { onClick: () => void }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 mb-4 text-secondary hover:underline focus:outline-none"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar</span>
      </button>
    );
  }

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

        {/* Auth stepper */}
        <AuthStepper currentStep={authStep === "login" ? "signup" : authStep} />
        {/* Current auth step with animation and back button */}
        {renderAuthStep()}
      </div>
    </div>
  );
};

export default Auth;
