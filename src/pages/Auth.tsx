import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Crown, Sparkles } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [step, setStep] = useState<"phone" | "code" | "email">("email");
  const [isSignUp, setIsSignUp] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  
  const { isAuthenticated, loading, sendSmsCode, verifyPhone, signInWithPhone, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha email e senha",
        variant: "destructive",
      });
      return;
    }

    // Check for special code
    if (password === "123123") {
      toast({
        title: "Acesso Especial",
        description: "Entrando com código especial...",
      });
      
      // Create a temporary user session
      localStorage.setItem("specialUser", JSON.stringify({
        id: "special-user-" + Date.now(),
        email,
        name: email.split('@')[0],
        profile: "cliente",
        special_access: true
      }));
      
      // Navigate to dashboard
      navigate("/dashboard");
      return;
    }

    const result = await signIn(email, password);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro no login",
        variant: "destructive",
      });
    }
  };

  const handleSendCode = async () => {
    if (!phone.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu telefone",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && !name.trim()) {
      toast({
        title: "Erro", 
        description: "Por favor, insira seu nome",
        variant: "destructive",
      });
      return;
    }

    const result = await sendSmsCode(phone);
    
    if (result.success) {
      setCodeSent(true);
      setStep("code");
      toast({
        title: "Código enviado",
        description: `Código SMS enviado para ${phone}${result.code ? ` (Dev: ${result.code})` : ''}`,
      });
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao enviar código SMS",
        variant: "destructive",
      });
    }
  };

  const handleVerifyCode = async () => {
    if (smsCode.length !== 6) {
      toast({
        title: "Erro",
        description: "Por favor, insira o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    // Check for special code
    if (smsCode === "123123") {
      toast({
        title: "Acesso Especial",
        description: "Entrando com código especial...",
      });
      
      localStorage.setItem("specialUser", JSON.stringify({
        id: "special-user-" + Date.now(),
        email: phone + "@gatepass.temp",
        name: name || phone,
        phone,
        profile: "cliente",
        special_access: true
      }));
      
      navigate("/dashboard");
      return;
    }

    let result;
    if (isSignUp) {
      result = await verifyPhone(phone, smsCode, name);
    } else {
      result = await signInWithPhone(phone, smsCode);
    }

    if (result.success) {
      toast({
        title: "Sucesso",
        description: isSignUp ? "Conta criada com sucesso!" : "Login realizado com sucesso!",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Erro",
        description: result.error || "Código inválido",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPhone("");
    setName("");
    setSmsCode("");
    setStep(authMode === "email" ? "email" : "phone");
    setCodeSent(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/20">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Crown className="h-16 w-16 text-primary drop-shadow-lg" />
              <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Alice Gate Pass
          </CardTitle>
          <CardDescription className="text-base">
            {authMode === "email" 
              ? "Entre com seu email e senha" 
              : step === "phone" 
                ? "Entre com seu telefone para acessar" 
                : "Digite o código enviado por SMS"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Auth Mode Selector */}
          <div className="flex gap-2 mb-4">
            <Button 
              variant={authMode === "email" ? "default" : "outline"}
              onClick={() => {
                setAuthMode("email");
                setStep("email");
                resetForm();
              }}
              className="flex-1"
            >
              Email
            </Button>
            <Button 
              variant={authMode === "phone" ? "default" : "outline"}
              onClick={() => {
                setAuthMode("phone");
                setStep("phone");
                resetForm();
              }}
              className="flex-1"
            >
              Telefone
            </Button>
          </div>

          {authMode === "email" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha ou 123123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleEmailAuth} 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          ) : (
            <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => {
              setIsSignUp(value === "signup");
              resetForm();
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                {step === "phone" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+55 (11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleSendCode} 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Enviando..." : "Enviar Código SMS"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Código SMS (ou use 123123)</Label>
                      <div className="flex justify-center">
                        <InputOTP value={smsCode} onChange={setSmsCode} maxLength={6}>
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
                    </div>
                    <Button 
                      onClick={handleVerifyCode} 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Verificando..." : "Verificar Código"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setStep("phone")} 
                      className="w-full"
                    >
                      Voltar
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                {step === "phone" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone-signup">Telefone</Label>
                      <Input
                        id="phone-signup"
                        type="tel"
                        placeholder="+55 (11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleSendCode} 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Enviando..." : "Enviar Código SMS"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Código SMS (ou use 123123)</Label>
                      <div className="flex justify-center">
                        <InputOTP value={smsCode} onChange={setSmsCode} maxLength={6}>
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
                    </div>
                    <Button 
                      onClick={handleVerifyCode} 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Verificando..." : "Criar Conta"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setStep("phone")} 
                      className="w-full"
                    >
                      Voltar
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Quick Access Buttons */}
          <div className="mt-6 space-y-3">
            <p className="text-sm text-center font-medium text-primary">🚀 Acesso Rápido para Testes:</p>
            
            <Button 
              onClick={() => {
                localStorage.clear(); // Limpa qualquer estado anterior
                localStorage.setItem("specialUser", JSON.stringify({
                  id: "admin-user-" + Date.now(),
                  email: "alice@gatepass.com",
                  name: "Alice Wonderland",
                  profile: "admin",
                  special_access: true
                }));
                toast({
                  title: "Acesso Liberado",
                  description: "Entrando como administrador...",
                });
                // Força reload para garantir que o estado seja atualizado
                window.location.href = "/dashboard";
              }}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              disabled={loading}
            >
              👑 Entrar como ADMIN
            </Button>

            <Button 
              onClick={() => {
                localStorage.clear(); // Limpa qualquer estado anterior
                localStorage.setItem("specialUser", JSON.stringify({
                  id: "cliente-user-" + Date.now(),
                  email: "joao@cliente.com", 
                  name: "João Silva",
                  profile: "cliente",
                  special_access: true
                }));
                toast({
                  title: "Acesso Liberado",
                  description: "Entrando como cliente...",
                });
                // Força reload para garantir que o estado seja atualizado
                window.location.href = "/dashboard";
              }}
              variant="outline"
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              disabled={loading}
            >
              👤 Entrar como CLIENTE
            </Button>
          </div>

          {/* Test credentials info */}
          <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/30">
            <p className="text-xs text-center text-muted-foreground">
              💡 Acesso liberado para desenvolvimento - clique nos botões acima para testar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;