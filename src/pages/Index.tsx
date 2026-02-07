import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, Shield, Star, Lock, Crown, Zap, Headphones } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallInstructions } from "@/components/pwa/iOSInstallInstructions";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/dashboard");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
    setTimeout(() => setIsLoaded(true), 100);
    return () => subscription.unsubscribe();
  }, [navigate]);

  const features = [
    { icon: Shield, title: "Segurança Absoluta", desc: "MFA obrigatório, criptografia ponta a ponta e arquitetura zero-trust." },
    { icon: Crown, title: "Acesso Exclusivo", desc: "Sistema de convites — apenas membros aprovados entram no ecossistema." },
    { icon: Star, title: "Experiência Premium", desc: "Interface de luxo com design glassmorphism e interações cinematográficas." },
    { icon: Headphones, title: "Suporte Inteligente", desc: "Assistência via WhatsApp com sessão criptografada e IA dedicada." },
  ];

  return (
    <div className="min-h-screen kitara-bg relative overflow-hidden selection:bg-secondary/30 selection:text-white">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] bg-gradient-radial from-secondary/8 via-secondary/3 to-transparent blur-[120px] opacity-50 animate-pulse-slow" />
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-radial from-primary/6 to-transparent blur-[100px] opacity-30" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-radial from-secondary/5 to-transparent blur-[90px] opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>

      <div className="relative z-50">
        <InstallPrompt />
        <IOSInstallInstructions />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-12 md:py-20 px-4">
        <div className="kitara-noise opacity-[0.15] mix-blend-overlay" />
        <div className="container mx-auto relative z-10 max-w-[1400px]">
          <div className="text-center flex flex-col items-center">

            {/* Badge */}
            <div className={`mb-12 md:mb-16 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}`} style={{ transitionDelay: "200ms" }}>
              <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-secondary/20 bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <Crown className="w-3.5 h-3.5 text-secondary" />
                <span className="text-[10px] md:text-xs font-cinzel tracking-[0.4em] text-secondary/90 uppercase font-light">Members Only • Invitation Required</span>
                <div className="w-1.5 h-1.5 rounded-full bg-secondary/60 animate-pulse" />
              </div>
            </div>

            {/* Video */}
            <div className={`relative mb-16 md:mb-20 w-full max-w-5xl mx-auto transition-all duration-1000 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} style={{ transitionDelay: "400ms" }}>
              <div className="relative rounded-[3rem] md:rounded-[4rem] overflow-hidden border-2 border-white/10 bg-gradient-to-br from-black/60 via-black/40 to-black/60 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
                <video
                  src="https://eickxhgarnwzovgdlujq.supabase.co/storage/v1/object/public/kitara_public/kitara_welcome.mp4"
                  autoPlay loop muted playsInline
                  className="w-full h-auto object-cover rounded-[3rem] md:rounded-[4rem] opacity-90"
                />
                <Sparkles className="h-10 w-10 text-secondary/90 absolute -top-5 -right-5 z-30 drop-shadow-[0_0_24px_rgba(255,255,255,0.7)] animate-pulse-slow" />
                <Zap className="h-7 w-7 text-secondary/70 absolute -bottom-4 -left-4 z-30 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse" />
              </div>
            </div>

            {/* Brand */}
            <div className={`mb-10 md:mb-14 space-y-6 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "600ms" }}>
              <h1 className="font-cinzel text-6xl md:text-8xl lg:text-[11rem] font-light tracking-[-0.04em] text-white leading-none relative">
                <span className="inline-block">KITARA</span>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
              </h1>
              <p className="text-xs md:text-sm text-secondary/50 tracking-[0.7em] uppercase font-cinzel font-extralight">Digital Sanctuary</p>
            </div>

            {/* Messaging */}
            <div className={`space-y-10 max-w-4xl mx-auto mb-14 md:mb-20 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "800ms" }}>
              <h2 className="text-2xl md:text-4xl lg:text-6xl text-white/95 font-light leading-[1.2] tracking-tight px-4">
                <span className="font-serif italic">Curating</span> the{" "}
                <span className="text-secondary font-normal">Almost Incredible</span>
              </h2>
              <p className="text-base md:text-lg lg:text-2xl text-muted-foreground/60 leading-relaxed font-light tracking-wide max-w-3xl mx-auto px-4">
                An exclusive digital experience where{" "}
                <span className="text-white/80">elite performance</span> converges with{" "}
                <span className="text-white/80">uncompromising privacy</span>.
              </p>
            </div>

            {/* CTA */}
            <div className={`relative transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "1000ms" }}>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="group relative overflow-hidden rounded-full px-12 md:px-16 py-7 md:py-8 text-sm md:text-base font-cinzel tracking-[0.3em] border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 backdrop-blur-2xl transition-all duration-700 hover:border-secondary/40 hover:shadow-[0_0_80px_-15px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-100"
              >
                <span className="relative z-10 flex items-center uppercase text-white/90 font-light">
                  Enter Portal <ArrowRight className="ml-4 h-5 w-5 opacity-50 group-hover:opacity-100" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <p className="text-xs tracking-[0.5em] uppercase text-secondary/60 font-cinzel mb-4">Por que KITARA</p>
            <h2 className="text-3xl md:text-5xl font-cinzel text-white/90 font-light">
              Feito para quem exige o <span className="text-secondary">extraordinário</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <Card
                key={title}
                className="kitara-card group hover:border-secondary/30 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-cinzel text-secondary">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="kitara-footer relative py-10 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/kitara/assets/logo.png" alt="KITARA" className="h-6 w-6 opacity-60" />
            <span className="text-xs text-muted-foreground font-cinzel tracking-wider">KITARA © {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-muted-foreground/50">Segurança • Exclusividade • Excelência</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
