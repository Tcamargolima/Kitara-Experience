import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shield, Star, Crown, Headphones } from "lucide-react";
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
    <div className="min-h-screen relative overflow-hidden selection:bg-secondary/30 selection:text-white">
      {/* Fullscreen Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          src="https://eickxhgarnwzovgdlujq.supabase.co/storage/v1/object/public/kitara_public/kitara_welcome.mp4"
          autoPlay loop muted playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
      </div>

      <div className="relative z-50">
        <InstallPrompt />
        <IOSInstallInstructions />
      </div>

      {/* Hero Section — VIP Layout */}
      <section className="relative z-10 min-h-screen flex flex-col justify-between px-4">
        {/* Top: Logo + Badge */}
        <div className="pt-12 flex flex-col items-center">
          <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}`} style={{ transitionDelay: "200ms" }}>
            <img
              src="/kitara/assets/logo.png"
              alt="KITARA logo"
              className="h-16 w-16 md:h-20 md:w-20 drop-shadow-[0_0_30px_rgba(197,160,89,0.3)] mb-6"
            />
          </div>
          <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}`} style={{ transitionDelay: "400ms" }}>
            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-xl">
              <Crown className="w-3.5 h-3.5 text-secondary" />
              <span className="text-[10px] md:text-xs font-cinzel tracking-[0.4em] text-secondary/80 uppercase font-light">Members Only • Invitation Required</span>
              <div className="w-1.5 h-1.5 rounded-full bg-secondary/60 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Center: intentionally empty for breathing space */}
        <div className="flex-1" />

        {/* Bottom: Title + Subtitle + CTA */}
        <div className="pb-20 md:pb-24 flex flex-col items-center text-center">
          <div className={`mb-8 md:mb-10 space-y-5 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "600ms" }}>
            <h1 className="font-cinzel text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tight text-white leading-none relative">
              <span className="inline-block">KITARA</span>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 md:w-32 h-0.5 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
            </h1>
            <p className="text-xs md:text-sm text-secondary/50 tracking-[0.7em] uppercase font-cinzel font-extralight">Digital Sanctuary</p>
          </div>

          <div className={`space-y-8 max-w-3xl mx-auto mb-12 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "800ms" }}>
            <h2 className="text-xl md:text-3xl lg:text-5xl text-white/90 font-light leading-[1.2] tracking-tight px-4">
              <span className="font-serif italic">Curating</span> the{" "}
              <span className="text-secondary font-normal">Almost Incredible</span>
            </h2>
            <p className="text-sm md:text-base lg:text-xl text-white/50 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4">
              An exclusive digital experience where{" "}
              <span className="text-white/80">elite performance</span> converges with{" "}
              <span className="text-white/80">uncompromising privacy</span>.
            </p>
          </div>

          <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "1000ms" }}>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="group relative overflow-hidden rounded-full px-12 md:px-16 py-7 md:py-8 text-sm md:text-base font-cinzel tracking-[0.3em] border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all duration-500 hover:border-secondary/30 hover:shadow-[0_0_60px_-10px_rgba(197,160,89,0.25)] hover:scale-105 active:scale-100"
            >
              <span className="relative z-10 flex items-center uppercase text-white/90 font-light">
                Enter Portal <ArrowRight className="ml-4 h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 md:py-32 px-4" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.85), hsl(0 0% 2%))" }}>
        <div className="container mx-auto max-w-6xl">
          <div className={`text-center mb-16 md:mb-20 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <p className="text-xs tracking-[0.5em] uppercase text-secondary/60 font-cinzel mb-4">Por que KITARA</p>
            <h2 className="text-3xl md:text-5xl font-cinzel text-white/90 font-light">
              Feito para quem exige o <span className="text-secondary">extraordinário</span>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <Card
                key={title}
                className="kitara-card group hover:border-white/15 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors duration-300">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base font-cinzel text-secondary font-semibold tracking-tight">{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="kitara-footer relative py-16 px-4">
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
