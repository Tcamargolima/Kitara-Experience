import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SecurityService } from "@/lib/security";

interface SignUpStepProps {
  inviteCode: string;
  onSignUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onBackToInvite: () => void;
}

export const SignUpStep = ({ inviteCode, onSignUp, onBackToInvite }: SignUpStepProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Password validation
  const passwordValidation = SecurityService.validatePassword(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const passwordChecks = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "Letra minúscula", valid: /[a-z]/.test(password) },
    { label: "Número", valid: /[0-9]/.test(password) },
    { label: "Símbolo especial", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha fraca",
        description: passwordValidation.errors[0],
        variant: "destructive",
      });
      return;
    }

    // Check password match
    if (!passwordsMatch) {
      toast({
        title: "Senhas não conferem",
        description: "A confirmação de senha deve ser igual à senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await onSignUp(email, password);

      if (result.success) {
        toast({
          title: "Conta criada!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
      } else {
        toast({
          title: "Erro no cadastro",
          description: result.error || "Não foi possível criar a conta.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="kitara-card w-full max-w-md mx-auto rounded-3xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <UserPlus className="h-12 w-12 text-secondary" />
        </div>
        <CardTitle className="font-cinzel text-secondary text-2xl">
          Criar Conta
        </CardTitle>
        <CardDescription>
          Código de convite: <span className="font-mono text-primary">{inviteCode}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="kitara-input"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="kitara-input pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password strength indicators */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-1 mt-2">
                {passwordChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    {check.valid ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={check.valid ? "text-primary" : "text-muted-foreground"}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="kitara-input"
              disabled={loading}
            />
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-1 text-xs mt-1">
                {passwordsMatch ? (
                  <>
                    <Check className="h-3 w-3 text-primary" />
                    <span className="text-primary">Senhas conferem</span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">Senhas não conferem</span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="kitara-button w-full"
            disabled={loading || !passwordValidation.isValid || !passwordsMatch}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBackToInvite}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Usar outro código de convite
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
