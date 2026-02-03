import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, Shield, Star, Lock, Crown, Zap } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallInstructions } from "@/components/pwa/iOSInstallInstructions";

const Index = () => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      } else {
        setUser(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
    
    // Trigger entrance animations
    setTimeout(() => setIsLoaded(true), 100);
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen kitara-bg relative overflow-hidden selection:bg-secondary/30 selection:text-white">
      
      {/* Advanced Atmospheric Background System */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] bg-gradient-radial from-secondary/8 via-secondary/3 to-transparent blur-[120px] opacity-50 animate-pulse-slow" />
        
        {/* Secondary Accent Glows */}
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-radial from-primary/6 to-transparent blur-[100px] opacity-30 animate-float" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-radial from-secondary/5 to-transparent blur-[90px] opacity-25 animate-float-delayed" />
        
        {/* Depth Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-50">
        <InstallPrompt />
        <IOSInstallInstructions />
      </div>

      {/* Hero Section - Cinematic Introduction */}
      <section className="relative min-h-screen flex items-center justify-center py-12 md:py-20 px-4">
        <div className="kitara-noise opacity-[0.15] mix-blend-overlay" />
        
        <div className="container mx-auto relative z-10 max-w-[1400px]">
          <div className="text-center flex flex-col items-center">
            
            {/* Exclusive Access Badge - Animated Entry */}
            <div 
              className={`mb-12 md:mb-16 transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-secondary/20 bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-secondary/40 hover:shadow-[0_8px_48px_rgba(0,0,0,0.6)] transition-all duration-500 group cursor-default">
                <Crown className="w-3.5 h-3.5 text-secondary group-hover:rotate-12 transition-transform duration-500" />
                <span className="text-[10px] md:text-xs font-cinzel tracking-[0.4em] text-secondary/90 uppercase font-light">
                  Members Only • Invitation Required
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-secondary/60 animate-pulse" />
              </div>
            </div>

            {/* Video Showcase - Premium Cinematic Frame */}
            <div 
              className={`relative mb-16 md:mb-20 w-full max-w-5xl mx-auto transition-all duration-1200 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              {/* Multi-Layered Atmospheric Glow System */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-radial from-secondary/30 via-secondary/10 to-transparent blur-[140px] opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />
                <div className="absolute inset-0 bg-secondary/15 blur-[80px] opacity-20 animate-pulse-slow" />
              </div>

              <div className="group relative">
                {/* Premium Video Container */}
                <div className="relative rounded-[3rem] md:rounded-[4rem] overflow-hidden border-2 border-white/10 bg-gradient-to-br from-black/60 via-black/40 to-black/60 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-all duration-1000 hover:scale-[1.01] hover:border-secondary/30 hover:shadow-[0_50px_150px_-25px_rgba(0,0,0,0.95)]">
                  
                  {/* Inner Luminescence */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-secondary/8 via-transparent to-white/5 mix-blend-overlay pointer-events-none z-10 opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                  
                  {/* Edge Highlight */}
                  <div className="absolute inset-0 rounded-[3rem] md:rounded-[4rem] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.3)] pointer-events-none z-20" />
                  
                  {/* Video Element */}
                  <video
                    src="https://eickxhgarnwzovgdlujq.supabase.co/storage/v1/object/public/kitara_public/kitara-show1.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto object-cover rounded-[3rem] md:rounded-[4rem] opacity-90 group-hover:opacity-100 transition-opacity duration-1000"
                  />
                  
                  {/* Floating Accent Elements */}
                  <Sparkles className="h-10 w-10 text-secondary/90 absolute -top-5 -right-5 z-30 drop-shadow-[0_0_24px_rgba(255,255,255,0.7)] animate-pulse-slow" />
                  <Zap className="h-7 w-7 text-secondary/70 absolute -bottom-4 -left-4 z-30 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                {/* Decorative Corner Accents */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-secondary/20 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-secondary/20 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </div>

            {/* Brand Typography - Staggered Reveal */}
            <div 
              className={`mb-10 md:mb-14 space-y-6 transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              <h1 className="font-cinzel text-7xl md:text-9xl lg:text-[11rem] font-light tracking-[-0.04em] text-white leading-none relative">
                <span className="inline-block hover:tracking-[-0.02em] transition-all duration-700">KITARA</span>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
              </h1>
              
              <div className="flex flex-col items-center gap-5">
                <p className="text-xs md:text-sm text-secondary/50 tracking-[0.7em] uppercase font-cinzel font-extralight">
                  Digital Sanctuary
                </p>
              </div>
            </div>

            {/* Hero Messaging - Elegant Reveal */}
            <div 
              className={`space-y-10 max-w-4xl mx-auto mb-14 md:mb-20 transition-all duration-1000 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl text-white/95 font-light leading-[1.2] tracking-tight px-4">
                <span className="font-serif italic">Curating</span> the{' '}
                <span className="text-secondary font-normal">Almost Incredible</span>
              </h2>
              
              <p className="text-base md:text-xl lg:text-2xl text-muted-foreground/60 leading-relaxed font-light tracking-wide max-w-3xl mx-auto px-4">
                An exclusive digital experience where{' '}
                <span className="text-white/80">elite performance</span> converges with{' '}
                <span className="text-white/80">uncompromising privacy</span>.
              </p>
            </div>

            {/* Premium CTA - Sophisticated Interaction */}
            <div 
              className={`relative transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '1000ms' }}
            >
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg" 
                className="group relative overflow-hidden rounded-full px-16 py-8 text-sm md:text-base font-cinzel tracking-[0.3em] border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 backdrop-blur-2xl transition-all duration-700 hover:border-secondary/40 hover:shadow-[0_0_80px_-15px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-100"
              >
                {/* Radial Shimmer on Hover */}
                <span className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Sweeping Light Effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-out" />
                
                <span className="relative z-10 flex items-center uppercase text-white/90 group-hover:text-white font-light">
                  Enter Portal
                  <ArrowRight className="ml-4 h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-700" />
                </span>
              </Button>
              
              <p className="mt-6 text-[9px] md:text-[10px] text-white/20 tracking-[0.5em] uppercase font-cinzel font-extralight">
                Exclusive Access
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Showcase - The Three Pillars */}
      <section className="py-32 md:py-48 relative">
        <div className="container mx-auto px-4 relative z-10 max-w-[1400px]">
          
          {/* Section Header */}
          <div className="text-center mb-28 md:mb-36">
            <div className="inline-flex flex-col items-center gap-6">
              <span className="text-secondary/30 text-[9px] md:text-[10px] tracking-[0.6em] uppercase font-cinzel block font-extralight">
                The Foundation
              </span>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-cinzel text-white font-light tracking-tight">
                Pillars of Excellence
              </h2>
              <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
            </div>
          </div>

          {/* Feature Grid - Asymmetric Premium Layout */}
          <div className="grid gap-8 md:gap-10 lg:gap-12 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Feature 1 */}
            <Card className="group relative overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-xl transition-all duration-1000 hover:-translate-y-3 hover:border-secondary/20 hover:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)] hover:bg-gradient-to-br hover:from-white/[0.08] hover:via-white/[0.04]">
              
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000" />
              
              <CardHeader className="text-center pt-16 pb-6 relative z-10">
                {/* Icon with Atmospheric Glow */}
                <div className="mb-10 relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-secondary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 scale-150" />
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group-hover:border-secondary/30 transition-all duration-700 group-hover:scale-110">
                    <Shield className="h-10 w-10 text-white/25 group-hover:text-secondary transition-all duration-700 stroke-[1.5px]" />
                  </div>
                </div>
                
                <CardTitle className="text-lg md:text-xl font-cinzel text-white/70 group-hover:text-white/90 tracking-[0.25em] uppercase font-light transition-colors duration-700">
                  Fortified<br/>Sanctuary
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 pb-16 px-10">
                <CardDescription className="text-center text-muted-foreground/40 group-hover:text-muted-foreground/70 text-sm md:text-base leading-loose font-light tracking-wide transition-colors duration-700">
                  Military-grade encryption within a sovereign digital fortress. Your universe, invisible to all.
                </CardDescription>
              </CardContent>

              {/* Corner Decorations */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-secondary/10 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Card>

            {/* Feature 2 - Elevated Card */}
            <Card className="group relative overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-xl transition-all duration-1000 hover:-translate-y-3 hover:border-secondary/20 hover:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)] hover:bg-gradient-to-br hover:from-white/[0.08] hover:via-white/[0.04] md:translate-y-8">
              
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000" />
              
              <CardHeader className="text-center pt-16 pb-6 relative z-10">
                <div className="mb-10 relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-secondary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 scale-150" />
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group-hover:border-secondary/30 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3">
                    <Star className="h-10 w-10 text-white/25 group-hover:text-secondary transition-all duration-700 stroke-[1.5px]" />
                  </div>
                </div>
                
                <CardTitle className="text-lg md:text-xl font-cinzel text-white/70 group-hover:text-white/90 tracking-[0.25em] uppercase font-light transition-colors duration-700">
                  Quantum<br/>Velocity
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 pb-16 px-10">
                <CardDescription className="text-center text-muted-foreground/40 group-hover:text-muted-foreground/70 text-sm md:text-base leading-loose font-light tracking-wide transition-colors duration-700">
                  Zero-latency synchronization architecture. Real-time fluidity across infinite dimensions.
                </CardDescription>
              </CardContent>

              <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-secondary/10 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:-translate-x-1 group-hover:translate-y-1" />
            </Card>

            {/* Feature 3 */}
            <Card className="group relative overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-xl transition-all duration-1000 hover:-translate-y-3 hover:border-secondary/20 hover:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)] hover:bg-gradient-to-br hover:from-white/[0.08] hover:via-white/[0.04] md:col-span-2 lg:col-span-1">
              
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000" />
              
              <CardHeader className="text-center pt-16 pb-6 relative z-10">
                <div className="mb-10 relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-secondary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 scale-150" />
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group-hover:border-secondary/30 transition-all duration-700 group-hover:scale-110">
                    <Lock className="h-10 w-10 text-white/25 group-hover:text-secondary transition-all duration-700 stroke-[1.5px]" />
                  </div>
                </div>
                
                <CardTitle className="text-lg md:text-xl font-cinzel text-white/70 group-hover:text-white/90 tracking-[0.25em] uppercase font-light transition-colors duration-700">
                  Sovereign<br/>Dominion
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 pb-16 px-10">
                <CardDescription className="text-center text-muted-foreground/40 group-hover:text-muted-foreground/70 text-sm md:text-base leading-loose font-light tracking-wide transition-colors duration-700">
                  Absolute command over access hierarchies. Role-based orchestration for the discerning elite.
                </CardDescription>
              </CardContent>

              <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-secondary/10 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
            </Card>

          </div>
        </div>
      </section>

      {/* Footer - Refined Signature */}
      <section className="py-24 md:py-32 relative border-t border-white/5 bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-2xl">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-2xl mx-auto flex flex-col items-center space-y-10">
            
            {/* Logo Mark */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 opacity-50 hover:opacity-100 transition-all duration-1000 cursor-default group">
              <img 
                src="/kitara/assets/logo.png" 
                alt="KITARA" 
                className="h-14 w-14 grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-60 group-hover:opacity-100 group-hover:scale-110" 
              />
              <span className="text-2xl md:text-3xl font-cinzel text-white/60 group-hover:text-white/90 tracking-[0.3em] font-light transition-all duration-1000">
                KITARA
              </span>
            </div>
            
            {/* Tagline */}
            <p className="text-muted-foreground/25 text-xs md:text-sm font-cinzel tracking-[0.25em] font-extralight">
              Redefining Digital Luxury
            </p>
            
            {/* Divider */}
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {/* Copyright */}
            <div className="space-y-2">
              <p className="text-white/10 text-[9px] md:text-[10px] uppercase tracking-[0.6em] font-cinzel font-extralight">
                © 2024 KITARA
              </p>
              <p className="text-white/5 text-[8px] tracking-[0.5em] font-cinzel">
                PRIVATE & CONFIDENTIAL
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .bg-gradient-radial {
          background-image: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default Index;
