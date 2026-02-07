import type { AuthStep } from "@/hooks/useSecureAuth";
import { Check } from "lucide-react";

interface AuthStepperProps {
  currentStep: AuthStep;
}

const STEPS: { key: AuthStep; label: string }[] = [
  { key: "invite", label: "Convite" },
  { key: "signup", label: "Cadastro" },
  { key: "mfa_setup", label: "MFA" },
  { key: "mfa_verify", label: "Verificação" },
];

const stepIndex = (step: AuthStep): number => {
  if (step === "login") return 1; // login maps to same position as signup
  return STEPS.findIndex((s) => s.key === step);
};

const AuthStepper = ({ currentStep }: AuthStepperProps) => {
  const current = stepIndex(currentStep);

  if (currentStep === "authenticated") return null;

  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, i) => {
        const isCompleted = i < current;
        const isActive = i === current;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                  ${isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "border-2 border-primary text-primary bg-primary/10"
                      : "border border-muted-foreground/30 text-muted-foreground/40"
                  }
                `}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] tracking-wide transition-colors duration-300 ${
                  isActive ? "text-primary font-medium" : isCompleted ? "text-secondary" : "text-muted-foreground/40"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 mb-5 transition-colors duration-500 ${
                  i < current ? "bg-primary" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AuthStepper;
