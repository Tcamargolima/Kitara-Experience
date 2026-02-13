import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginStepProps {
  onSignIn: (email: string, password: string) => Promise<{ success: boolean; needsMfa?: boolean; error?: string }>;
  onBackToInvite: () => void;
}

export const LoginStep = ({ onSignIn, onBackToInvite }: LoginStepProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await onSignIn(email, password);

      if (result.success) {
        if (result.needsMfa) {
          toast({
            title: "Verificação MFA",
            description: "Insira o código do seu autenticador.",
          });
        } else {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta ao KITARA.",
          });
        }
      } else {
        toast({
          title: "Erro no login",
          description: result.error || "Credenciais inválidas.",
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
          <LogIn className="h-12 w-12 text-secondary" />
        </div>
        <CardTitle className="font-cinzel text-secondary text-2xl">
          Entrar
        </CardTitle>
        <CardDescription>
          Acesse sua conta KITARA
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
          </div>

          <Button
            type="submit"
            className="kitara-button w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Não tem conta?{" "}
            <button
              type="button"
              onClick={onBackToInvite}
              className="text-secondary hover:underline font-medium"
            >
              Cadastre-se com convite
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
