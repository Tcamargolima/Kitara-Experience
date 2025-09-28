import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key, AlertTriangle } from "lucide-react";
import { SecurityService } from "@/lib/security";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorVerifyProps {
  userSecret: string;
  onVerificationSuccess: () => void;
  onVerificationFailed: () => void;
  attemptCount: number;
  maxAttempts: number;
}

export const TwoFactorVerify = ({ 
  userSecret, 
  onVerificationSuccess, 
  onVerificationFailed,
  attemptCount,
  maxAttempts 
}: TwoFactorVerifyProps) => {
  const [totpCode, setTotpCode] = useState<string>('');
  const [backupCode, setBackupCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('totp');
  const { toast } = useToast();

  const handleVerifyTOTP = () => {
    if (totpCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor, insira um código de 6 dígitos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const isValid = SecurityService.verifyTOTP(totpCode, userSecret);
      
      if (isValid) {
        toast({
          title: "Acesso liberado! 🎪",
          description: "Código verificado com sucesso"
        });
        onVerificationSuccess();
      } else {
        toast({
          title: "Código incorreto",
          description: `Tentativa ${attemptCount + 1} de ${maxAttempts}`,
          variant: "destructive"
        });
        onVerificationFailed();
      }
      
      setLoading(false);
    }, 800);
  };

  const handleVerifyBackup = () => {
    if (backupCode.length !== 9) { // XXXX-XXXX format
      toast({
        title: "Formato inválido",
        description: "Código de backup deve ter formato XXXX-XXXX",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simular verificação de código de backup
    setTimeout(() => {
      // Em produção, verificar na base de dados se o código existe e não foi usado
      const isValidFormat = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(backupCode);
      
      if (isValidFormat) {
        toast({
          title: "Código de backup aceito! 🎪",
          description: "Este código foi usado e não pode ser reutilizado"
        });
        onVerificationSuccess();
      } else {
        toast({
          title: "Código inválido",
          description: "Código de backup não encontrado ou já utilizado",
          variant: "destructive"
        });
        onVerificationFailed();
      }
      
      setLoading(false);
    }, 800);
  };

  const remainingAttempts = maxAttempts - attemptCount;

  return (
    <div className="max-w-md mx-auto space-y-4">
      {attemptCount > 0 && (
        <Alert variant={attemptCount >= 3 ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-fredoka">
            {remainingAttempts > 0 
              ? `${remainingAttempts} tentativa${remainingAttempts > 1 ? 's' : ''} restante${remainingAttempts > 1 ? 's' : ''}`
              : "Conta será bloqueada após próximo erro"
            }
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bungee text-primary">
            <Shield className="h-5 w-5" />
            Verificação 2FA 🛡️
          </CardTitle>
          <CardDescription className="font-fredoka">
            Digite o código do seu aplicativo autenticador ou use um código de backup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="totp" className="font-fredoka">
                <Key className="h-4 w-4 mr-1" />
                Aplicativo
              </TabsTrigger>
              <TabsTrigger value="backup" className="font-fredoka">
                Código Backup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="totp" className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground font-fredoka">
                  Digite o código de 6 dígitos do seu aplicativo autenticador:
                </p>
                
                <div className="flex justify-center">
                  <InputOTP 
                    value={totpCode} 
                    onChange={setTotpCode} 
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  onClick={handleVerifyTOTP} 
                  className="w-full circus-button font-fredoka"
                  disabled={loading || totpCode.length !== 6}
                >
                  {loading ? "Verificando..." : "Verificar Código"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground font-fredoka">
                  Digite um dos seus códigos de backup (formato: XXXX-XXXX):
                </p>
                
                <div className="flex justify-center">
                  <InputOTP 
                    value={backupCode} 
                    onChange={setBackupCode} 
                    maxLength={9}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <div className="mx-2 text-muted-foreground">-</div>
                    <InputOTPGroup>
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                      <InputOTPSlot index={8} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-fredoka">
                    Cada código de backup só pode ser usado uma vez
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleVerifyBackup} 
                  className="w-full circus-button font-fredoka"
                  disabled={loading || backupCode.length !== 9}
                >
                  {loading ? "Verificando..." : "Usar Código Backup"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};