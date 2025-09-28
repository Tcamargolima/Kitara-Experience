import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Smartphone, 
  Clock, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { useToast } from "@/hooks/use-toast";

interface SecuritySettingsProps {
  userEmail: string;
  has2FA: boolean;
  loginAttempts: number;
  lastLogin: Date | null;
  onToggle2FA: (enabled: boolean, secret?: string, backupCodes?: string[]) => void;
}

export const SecuritySettings = ({ 
  userEmail, 
  has2FA, 
  loginAttempts,
  lastLogin,
  onToggle2FA 
}: SecuritySettingsProps) => {
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();

  // Mock backup codes (em produção, vir da base de dados)
  const backupCodes = [
    'A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6',
    'Q7R8-S9T0', 'U1V2-W3X4', 'Y5Z6-A7B8', 'C9D0-E1F2'
  ];

  const handleEnable2FA = () => {
    setShow2FASetup(true);
  };

  const handleDisable2FA = () => {
    toast({
      title: "2FA Desativado",
      description: "Autenticação de dois fatores foi desativada",
      variant: "destructive"
    });
    onToggle2FA(false);
  };

  const handleSetupComplete = (secret: string, codes: string[]) => {
    onToggle2FA(true, secret, codes);
    setShow2FASetup(false);
    toast({
      title: "2FA Configurado! 🎪",
      description: "Sua conta está mais segura agora"
    });
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

  if (show2FASetup) {
    return (
      <TwoFactorSetup
        userEmail={userEmail}
        onSetupComplete={handleSetupComplete}
        onCancel={() => setShow2FASetup(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bungee text-primary">
            <Settings className="h-5 w-5" />
            Configurações de Segurança 🛡️
          </CardTitle>
          <CardDescription className="font-fredoka">
            Gerencie as configurações de segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status da Segurança */}
          <div className="space-y-3">
            <h3 className="font-fredoka font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Status da Segurança
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {has2FA ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-fredoka font-medium">Autenticação 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      {has2FA ? 'Ativada e funcionando' : 'Recomendamos ativar para maior segurança'}
                    </p>
                  </div>
                </div>
                <Badge variant={has2FA ? "default" : "secondary"}>
                  {has2FA ? 'Ativada' : 'Desativada'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-fredoka font-medium">Último Acesso</p>
                    <p className="text-sm text-muted-foreground">
                      {lastLogin ? lastLogin.toLocaleString('pt-BR') : 'Nunca'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {loginAttempts} tentativas hoje
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Configuração 2FA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-fredoka font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Autenticação de Dois Fatores
                </h3>
                <p className="text-sm text-muted-foreground">
                  Adiciona uma camada extra de segurança à sua conta
                </p>
              </div>
              <Switch
                checked={has2FA}
                onCheckedChange={has2FA ? handleDisable2FA : handleEnable2FA}
              />
            </div>

            {has2FA && (
              <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="font-fredoka">
                    2FA está ativo. Use seu aplicativo autenticador para fazer login.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-fredoka text-sm font-medium">Códigos de Backup</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowBackupCodes(!showBackupCodes)}
                      >
                        {showBackupCodes ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadBackupCodes}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {showBackupCodes && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs w-6 justify-center">
                            {index + 1}
                          </Badge>
                          <code className="text-xs">{code}</code>
                        </div>
                      ))}
                    </div>
                  )}

                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription className="text-xs font-fredoka">
                      Guarde os códigos de backup em local seguro. Cada código só pode ser usado uma vez.
                    </AlertDescription>
                  </Alert>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShow2FASetup(true)}
                  className="font-fredoka"
                >
                  Reconfigurar 2FA
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};