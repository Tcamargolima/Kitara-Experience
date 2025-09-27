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
import { Tent, Sparkles, PartyPopper, Star } from "lucide-react";

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
      <div className="min-h-screen circus-bg flex items-center justify-center">
        <div className="circus-stars">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-accent mx-auto mb-4"></div>
          <p className="text-primary font-fredoka font-medium">Preparando o espetáculo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen circus-bg flex items-center justify-center">
      <Card className="circus-card w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6 circus-stars">
            <div className="relative">
              <Tent className="h-20 w-20 text-primary drop-shadow-lg animate-pulse" />
              <PartyPopper className="h-6 w-6 text-accent absolute -top-1 -right-1 animate-spin" />
              <Star className="h-4 w-4 text-secondary absolute -bottom-1 -left-1 animate-pulse delay-500" />
              <Sparkles className="h-5 w-5 text-secondary absolute top-1 left-1 animate-pulse delay-1000" />
            </div>
          </div>
          <CardTitle className="circus-title text-4xl font-bungee mb-2">
            MOSKINO
          </CardTitle>
          <CardDescription className="text-lg font-fredoka font-medium text-foreground">
            🎪 {authMode === "email" 
              ? "Entre no Circo Digital" 
              : step === "phone" 
                ? "Garanta sua entrada no espetáculo" 
                : "Digite o código mágico"
            } 🎪
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Auth Mode Selector */}
          <div className="flex gap-3 mb-6">
            <Button 
              variant={authMode === "email" ? "default" : "outline"}
              onClick={() => {
                setAuthMode("email");
                setStep("email");
                resetForm();
              }}
              className="flex-1 font-fredoka font-bold"
            >
              ✉️ Email
            </Button>
            <Button 
              variant={authMode === "phone" ? "default" : "outline"}
              onClick={() => {
                setAuthMode("phone");
                setStep("phone");
                resetForm();
              }}
              className="flex-1 font-fredoka font-bold"
            >
              📱 Telefone
            </Button>
          </div>

          {authMode === "email" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-fredoka font-medium">🎭 Email do Artista</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-fredoka"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-fredoka font-medium">🔑 Senha Mágica</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha ou 123123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-fredoka"
                />
              </div>
              <Button 
                onClick={handleEmailAuth} 
                className="circus-button w-full font-fredoka"
                disabled={loading}
              >
                {loading ? "Preparando entrada..." : "🎪 Entrar no Circo 🎪"}
              </Button>
            </div>
          ) : (
            <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => {
              setIsSignUp(value === "signup");
              resetForm();
            }}>
              <TabsList className="grid w-full grid-cols-2 circus-card">
                <TabsTrigger value="signin" className="font-fredoka font-bold">🎭 Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="font-fredoka font-bold">⭐ Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                {step === "phone" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-fredoka font-medium">📱 Telefone Circense</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+55 (11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="font-fredoka"
                      />
                    </div>
                    <Button 
                      onClick={handleSendCode} 
                      className="circus-button w-full font-fredoka"
                      disabled={loading}
                    >
                      {loading ? "Enviando código..." : "✨ Enviar Código Mágico ✨"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="font-fredoka font-medium">🎪 Código Mágico (ou use 123123)</Label>
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
                      className="circus-button w-full font-fredoka"
                      disabled={loading}
                    >
                      {loading ? "Verificando..." : "🎭 Entrar no Espetáculo 🎭"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setStep("phone")} 
                      className="w-full font-fredoka"
                    >
                      ← Voltar
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                {step === "phone" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-fredoka font-medium">🎨 Nome do Artista</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="font-fredoka"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone-signup" className="font-fredoka font-medium">📱 Telefone</Label>
                      <Input
                        id="phone-signup"
                        type="tel"
                        placeholder="+55 (11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="font-fredoka"
                      />
                    </div>
                    <Button 
                      onClick={handleSendCode} 
                      className="circus-button w-full font-fredoka"
                      disabled={loading}
                    >
                      {loading ? "Enviando..." : "✨ Enviar Código de Cadastro ✨"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="font-fredoka font-medium">🎪 Código Mágico (ou use 123123)</Label>
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
                      className="circus-button w-full font-fredoka"
                      disabled={loading}
                    >
                      {loading ? "Criando conta..." : "🌟 Juntar-se ao Circo 🌟"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setStep("phone")} 
                      className="w-full font-fredoka"
                    >
                      ← Voltar
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Quick Access Buttons */}
          <div className="mt-8 space-y-4">
            <p className="text-center font-fredoka font-bold text-primary text-lg">🚀 Acesso Rápido - Testes 🚀</p>
            
            <Button 
              onClick={() => {
                localStorage.clear();
                localStorage.setItem("specialUser", JSON.stringify({
                  id: "admin-user-" + Date.now(),
                  email: "diretor@moskino.com",
                  name: "Diretor MOSKINO",
                  profile: "admin",
                  special_access: true
                }));
                toast({
                  title: "🎪 Acesso Liberado!",
                  description: "Bem-vindo, Diretor do Circo!",
                });
                window.location.href = "/dashboard";
              }}
              className="circus-button w-full font-fredoka text-background"
              disabled={loading}
            >
              🎩 Entrar como DIRETOR DO CIRCO 🎩
            </Button>

            <Button 
              onClick={() => {
                localStorage.clear();
                localStorage.setItem("specialUser", JSON.stringify({
                  id: "cliente-user-" + Date.now(),
                  email: "espectador@moskino.com", 
                  name: "Espectador VIP",
                  profile: "cliente",
                  special_access: true
                }));
                toast({
                  title: "🎭 Entrada Autorizada!",
                  description: "Bem-vindo ao espetáculo!",
                });
                window.location.href = "/dashboard";
              }}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10 font-fredoka font-bold"
              disabled={loading}
            >
              🎪 Entrar como ESPECTADOR VIP 🎪
            </Button>
          </div>

          {/* Test credentials info */}
          <div className="mt-6 circus-card p-4 border-2 border-secondary/30 bg-gradient-to-r from-secondary/10 to-accent/10">
            <p className="text-sm text-center font-fredoka font-medium text-foreground">
              ✨ Portal mágico aberto para testes - Escolha sua entrada! ✨
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;