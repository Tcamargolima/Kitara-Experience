import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Lock
} from "lucide-react";
import { TwoFactorVerify } from "@/components/security/TwoFactorVerify";
import { SecurityService } from "@/lib/security";

const DEFAULT_ADMIN_CREDENTIALS = {
  email: "admin@kitara.com",
  username: "admin",
  password: "Admin@123!",
};
import { useSecurity } from "@/hooks/useSecurity";
import { useToast } from "@/hooks/use-toast";

interface SecureLoginProps {
  onLoginSuccess: (email: string, password: string) => void;
  onLoginFailed: () => void;
  loading: boolean;
}

export const SecureLogin = ({ onLoginSuccess, onLoginFailed, loading }: SecureLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [show2FA, setShow2FA] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();

  // Simular usuário com 2FA ativado
  const mockUser2FA = {
    email: DEFAULT_ADMIN_CREDENTIALS.email,
    has2FA: true,
    secret: 'JBSWY3DPEHPK3PXP' // Mock secret para demonstração
  };

  const calculatePasswordStrength = (pwd: string): number => {
    const validation = SecurityService.validatePassword(pwd);
    const criteria = [
      pwd.length >= 8,
      /[A-Z]/.test(pwd),
      /[a-z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    ];
    
    return (criteria.filter(Boolean).length / criteria.length) * 100;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleLogin = () => {
    // Verificar se está bloqueado
    if (isLocked) {
      toast({
        title: "Conta Bloqueada",
        description: `Aguarde ${Math.ceil(lockTimeRemaining / 60)} minutos antes de tentar novamente`,
        variant: "destructive"
      });
      return;
    }

    // Validar campos
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha",
        variant: "destructive"
      });
      return;
    }

    // Verificar credenciais padrão do admin
    const isValidCredentials = (
      email === DEFAULT_ADMIN_CREDENTIALS.email && 
      password === DEFAULT_ADMIN_CREDENTIALS.password
    ) || (
      email === DEFAULT_ADMIN_CREDENTIALS.username && 
      password === DEFAULT_ADMIN_CREDENTIALS.password
    );

    if (!isValidCredentials) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockTimeRemaining(30 * 60); // 30 minutos
        
        // Countdown do bloqueio
        const interval = setInterval(() => {
          setLockTimeRemaining(prev => {
            if (prev <= 1) {
              setIsLocked(false);
              setLoginAttempts(0);
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      toast({
        title: "Credenciais inválidas",
        description: `Tentativa ${newAttempts} de 5. ${5 - newAttempts} tentativas restantes.`,
        variant: "destructive"
      });
      
      onLoginFailed();
      return;
    }

    // Verificar se usuário tem 2FA
    if (mockUser2FA.has2FA && email === mockUser2FA.email) {
      setShow2FA(true);
      toast({
        title: "Credenciais válidas! 🎪",
        description: "Agora digite o código 2FA para completar o login"
      });
      return;
    }

    // Login sem 2FA
    toast({
      title: "Login realizado! 🎪",
      description: "Bem-vindo ao MOSKINO Circo Digital"
    });
    onLoginSuccess(email, password);
  };

  const handle2FASuccess = () => {
    setShow2FA(false);
    toast({
      title: "Acesso autorizado! 🎪",
      description: "2FA verificado com sucesso"
    });
    onLoginSuccess(email, password);
  };

  const handle2FAFailed = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);

    if (newAttempts >= 5) {
      setIsLocked(true);
      setLockTimeRemaining(30 * 60);
      setShow2FA(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Fraca";
    if (passwordStrength < 80) return "Média";
    return "Forte";
  };

  if (show2FA) {
    return (
      <TwoFactorVerify
        userSecret={mockUser2FA.secret}
        onVerificationSuccess={handle2FASuccess}
        onVerificationFailed={handle2FAFailed}
        attemptCount={loginAttempts}
        maxAttempts={5}
      />
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-cinzel text-secondary">
          <Shield className="h-5 w-5" />
          Login Seguro MOSKINO 🎪
        </CardTitle>
        <CardDescription className="font-medium">
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status de segurança */}
        {loginAttempts > 0 && !isLocked && (
          <Alert variant={loginAttempts >= 3 ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {loginAttempts >= 3 ? (
                <span>⚠️ Atenção: {5 - loginAttempts} tentativas restantes</span>
              ) : (
                <span>Tentativas incorretas: {loginAttempts}/5</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isLocked && (
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertDescription className="font-medium">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Conta bloqueada por {Math.ceil(lockTimeRemaining / 60)} minutos
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Credenciais padrão (apenas para demonstração) */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
            <AlertDescription className="font-medium text-sm">
            <strong>Demo - Credenciais:</strong><br />
            Usuário: <code>admin</code> ou <code>{DEFAULT_ADMIN_CREDENTIALS.email}</code><br />
            Senha: <code>{DEFAULT_ADMIN_CREDENTIALS.password}</code>
          </AlertDescription>
        </Alert>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">Email/Usuário</Label>
            <Input
              id="email"
              type="text"
              placeholder="Digite seu email ou usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || isLocked}
              className="font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={loading || isLocked}
                className="font-medium pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || isLocked}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            
            {/* Medidor de força da senha */}
            {password && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    Força da senha:
                  </span>
                  <span className={`text-xs font-medium font-medium ${
                    passwordStrength < 40 ? 'text-red-500' : 
                    passwordStrength < 80 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <Progress 
                  value={passwordStrength} 
                  className="h-1"
                />
              </div>
            )}
          </div>

          <Button 
            onClick={handleLogin}
            disabled={loading || isLocked || !email || !password}
            className="w-full kitara-button"
          >
            {loading ? "Entrando..." : "Entrar no Circo"}
          </Button>
        </div>

        {/* Validações de senha */}
        {password && !SecurityService.validatePassword(password).isValid && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium text-sm">
              <strong>Requisitos da senha:</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li className={password.length >= 8 ? 'text-green-500' : 'text-red-500'}>
                  ✓ Mínimo 8 caracteres
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-red-500'}>
                  ✓ Pelo menos uma maiúscula
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-500' : 'text-red-500'}>
                  ✓ Pelo menos uma minúscula
                </li>
                <li className={/[0-9]/.test(password) ? 'text-green-500' : 'text-red-500'}>
                  ✓ Pelo menos um número
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : 'text-red-500'}>
                  ✓ Pelo menos um símbolo
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};