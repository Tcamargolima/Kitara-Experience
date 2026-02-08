import React from "react";

const steps = [
  { key: "invite", label: "Convite" },
  { key: "signup", label: "Cadastro" },
  { key: "mfa_setup", label: "Configurar MFA" },
  { key: "mfa_verify", label: "Verificar MFA" },
];

interface AuthStepperProps {
  currentStep: "invite" | "signup" | "mfa_setup" | "mfa_verify";
}

const AuthStepper: React.FC<AuthStepperProps> = ({ currentStep }) => {
  const currentIdx = steps.findIndex((s) => s.key === currentStep);
  return (
    <nav className="flex items-center justify-center mb-8 animate-fade-in">
      <ol className="flex gap-4">
        {steps.map((step, idx) => (
          <li key={step.key} className="flex items-center">
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition-all duration-300
                ${idx < currentIdx ? "bg-secondary text-primary" : "bg-primary text-background"}
                ${idx === currentIdx ? "ring-2 ring-secondary scale-110" : "opacity-60"}`}
            >
              {idx + 1}
            </div>
            <span className={`ml-2 text-xs font-medium ${idx === currentIdx ? "text-secondary" : "text-muted-foreground"}`}>{step.label}</span>
            {idx < steps.length - 1 && (
              <span className="mx-2 text-muted-foreground">→</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default AuthStepper;
