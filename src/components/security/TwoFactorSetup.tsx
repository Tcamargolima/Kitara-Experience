import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Shield, Smartphone, Key, CheckCircle } from "lucide-react";
import { SecurityService } from "@/lib/security";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'qrcode';

interface TwoFactorSetupProps {
  userEmail: string;
  onSetupComplete: (secret: string, backupCodes: string[]) => void;
  onCancel: () => void;
}

export const TwoFactorSetup = ({ userEmail, onSetupComplete, onCancel }: TwoFactorSetupProps) => {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup'>('generate');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [qrUri, setQrUri] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateQRCode();
  }, [userEmail]);

  const generateQRCode = async () => {
    try {
      const { secret: newSecret, qrCodeUri } = SecurityService.generateTOTPSecret(userEmail);
      setSecret(newSecret);
      setQrUri(qrCodeUri);
      
      const qrDataUrl = await QRCode.toDataURL(qrCodeUri, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar código QR",
        variant: "destructive"
      });
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor, insira um código de 6 dígitos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simular delay para verificação
    setTimeout(() => {
      const isValid = SecurityService.verifyTOTP(verificationCode, secret);
      
      if (isValid) {
        const codes = SecurityService.generateBackupCodes();
        setBackupCodes(codes);
        setStep('backup');
        toast({
          title: "2FA Configurado! 🎪",
          description: "Autenticação de dois fatores ativada com sucesso",
        });
      } else {
        toast({
          title: "Código incorreto",
          description: "Verifique o código no seu aplicativo autenticador",
          variant: "destructive"
        });
      }
      
      setLoading(false);
    }, 1000);
  };

  const handleFinishSetup = () => {
    onSetupComplete(secret, backupCodes);
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      toast({
        title: "Copiado!",
        description: "Chave secreta copiada para a área de transferência"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao copiar chave secreta",
        variant: "destructive"
      });
    }
  };

  const downloadBackupCodes = () => {
    const content = `MOSKINO CIRCO DIGITAL - Códigos de Backup 2FA\n\n` +
      `Email: ${userEmail}\n` +
      `Data: ${new Date().toLocaleString('pt-BR')}\n\n` +
      `CÓDIGOS DE BACKUP:\n` +
      backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n') +
      `\n\n⚠️  IMPORTANTE:\n` +
      `- Guarde estes códigos em local seguro\n` +
      `- Cada código pode ser usado apenas uma vez\n` +
      `- Use apenas se não conseguir acessar seu aplicativo autenticador`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moskino-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'generate') {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cinzel text-secondary">
            <Shield className="h-5 w-5" />
            Configurar 2FA
          </CardTitle>
          <CardDescription className="font-medium">
            Configure a autenticação de dois fatores para maior segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription className="font-medium">
              <strong>Passo 1:</strong> Instale um aplicativo autenticador como Google Authenticator ou Authy
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="font-medium text-sm text-muted-foreground">
              Escaneie este QR Code com seu aplicativo autenticador:
            </p>
            
            {qrCodeUrl && (
              <div className="inline-block p-4 bg-card rounded-lg border border-secondary/20">
                <img src={qrCodeUrl} alt="QR Code 2FA" className="mx-auto bg-white p-2 rounded" />
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-medium text-sm">Ou insira manualmente:</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-xs break-all">{secret}</code>
                <Button size="sm" variant="outline" onClick={copySecret}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={() => setStep('verify')} 
              className="flex-1 kitara-button"
            >
              Próximo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cinzel text-secondary">
            <Key className="h-5 w-5" />
            Verificar 2FA
          </CardTitle>
          <CardDescription className="font-medium">
            Digite o código de 6 dígitos do seu aplicativo autenticador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <InputOTP 
                value={verificationCode} 
                onChange={setVerificationCode} 
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

            <p className="text-sm text-muted-foreground font-medium">
              O código muda a cada 30 segundos
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setStep('generate')} 
              className="flex-1"
              disabled={loading}
            >
              Voltar
            </Button>
            <Button 
              onClick={handleVerifyCode} 
              className="flex-1 kitara-button"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? "Verificando..." : "Verificar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-cinzel text-secondary">
          <CheckCircle className="h-5 w-5" />
          2FA Ativado! 🎪
        </CardTitle>
        <CardDescription className="font-medium">
          Salve os códigos de backup em local seguro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription className="font-medium">
            <strong>Importante:</strong> Guarde estes códigos de backup. Você pode usá-los se perder acesso ao seu aplicativo autenticador.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium font-medium">Códigos de Backup</Label>
            <Button size="sm" variant="outline" onClick={downloadBackupCodes}>
              <Download className="h-3 w-3 mr-1" />
              Baixar
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <Badge variant="outline" className="text-xs">
                  {index + 1}
                </Badge>
                <code className="text-sm">{code}</code>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleFinishSetup} 
          className="w-full kitara-button"
        >
          Finalizar Configuração
        </Button>
      </CardContent>
    </Card>
  );
};