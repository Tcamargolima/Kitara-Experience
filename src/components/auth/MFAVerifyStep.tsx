import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SecurityService } from "@/lib/security";
import { getMfaSecret, logSecurityEvent } from "@/lib/api";

interface MFAVerifyStepProps {
  onComplete: () => void;
  onSignOut: () => void;
}

export const MFAVerifyStep = ({ onComplete, onSignOut }: MFAVerifyStepProps) => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (token.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user's MFA secret
      const secret = await getMfaSecret();

      if (!secret) {
        toast({
          title: "Erro",
          description: "MFA não configurado corretamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Verify the token
      const isValid = SecurityService.verifyTOTP(token, secret);

      if (isValid) {
        await logSecurityEvent("mfa_verify", true);
        toast({
          title: "Verificação concluída!",
          description: "Bem-vindo ao KITARA.",
        });
        onComplete();
      } else {
        await logSecurityEvent("mfa_verify", false, { reason: "invalid_token" });
        toast({
          title: "Código incorreto",
          description: "O código não corresponde. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar o código.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="kitara-card w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <ShieldCheck className="h-12 w-12 text-secondary" />
        </div>
        <CardTitle className="font-cinzel text-secondary text-2xl">
          Verificação MFA
        </CardTitle>
        <CardDescription>
          Digite o código do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-token">Código de Verificação</Label>
            <Input
              id="mfa-token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="kitara-input text-center text-2xl tracking-widest"
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Abra seu autenticador e digite o código de 6 dígitos
            </p>
          </div>

          <Button
            type="submit"
            className="kitara-button w-full"
            disabled={loading || token.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onSignOut}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sair e usar outra conta
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
