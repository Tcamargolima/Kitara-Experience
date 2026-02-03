import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SecurityService } from "@/lib/security";
import { setupMfa } from "@/lib/api";
import QRCode from "qrcode";

interface MFASetupStepProps {
  userEmail: string;
  onComplete: () => void;
}

export const MFASetupStep = ({ userEmail, onComplete }: MFASetupStepProps) => {
  const [secret, setSecret] = useState<string>("");
  const [qrUri, setQrUri] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate TOTP secret on mount
  useEffect(() => {
    const { secret: newSecret, qrCodeUri } = SecurityService.generateTOTPSecret(userEmail);
    setSecret(newSecret);
    setQrUri(qrCodeUri);

    // Generate QR code image
    QRCode.toDataURL(qrCodeUri, { width: 200, margin: 2 })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, [userEmail]);

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copiado!",
        description: "Chave secreta copiada para a área de transferência.",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar. Selecione manualmente.",
        variant: "destructive",
      });
    }
  };

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
      // Verify the token locally first
      const isValid = SecurityService.verifyTOTP(token, secret);

      if (!isValid) {
        toast({
          title: "Código incorreto",
          description: "O código não corresponde. Verifique seu autenticador.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Save MFA secret to database
      const success = await setupMfa(secret);

      if (success) {
        toast({
          title: "MFA ativado!",
          description: "Sua conta agora está protegida com autenticação em duas etapas.",
        });
        onComplete();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar a configuração MFA.",
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
          <Shield className="h-12 w-12 text-secondary" />
        </div>
        <CardTitle className="font-cinzel text-secondary text-2xl">
          Configurar MFA
        </CardTitle>
        <CardDescription>
          A autenticação em duas etapas é obrigatória para acessar o KITARA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Escaneie o QR code com seu aplicativo autenticador (Google Authenticator, Authy, etc.):
          </p>
          {qrCodeUrl ? (
            <div className="p-4 bg-white rounded-lg">
              <img src={qrCodeUrl} alt="QR Code MFA" className="w-48 h-48" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-muted animate-pulse rounded-lg" />
          )}
        </div>

        {/* Manual entry */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Ou insira a chave manualmente:
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={secret}
              readOnly
              className="kitara-input font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopySecret}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Verification */}
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
            />
            <p className="text-xs text-muted-foreground text-center">
              Digite o código de 6 dígitos do seu autenticador
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
              "Ativar MFA"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
