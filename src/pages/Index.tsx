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
        <div className="absolute top-1/4 left=0 w-[600px] h-[600px] bg-gradient-radial from-primary/6 to-transparent blur-[100px] opacity-30 animate-float" />
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

            {/* Video Showcase - Updated Video Link */}
            <div 
              className={`relative mb-16 md:mb-20 w-full max-w-5xl mx-auto transition-all duration-1200 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="group relative">
                {/* Updated Video Container */}
                <div className="relative rounded-[3rem] md:rounded-[4rem] overflow-hidden border-2 border-white/10 bg-gradient-to-br from-black/60 via-black/40 to-black/60 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-all duration-1000 hover:scale-[1.01] hover:border-secondary/30 hover:shadow-[0_50px_150px_-25px_rgba(0,0,0,0.95)]">
                  
                  {/* Video Element (Updated) */}
                  <video
                    src="https://eickxhgarnwzovgdlujq.supabase.co/storage/v1/object/public/kitara_public/kitara_welcome.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto object-cover rounded-[3rem] md:rounded-[4rem] opacity-90 group-hover:opacity-100 transition-opacity duration-1000"
                  />
                  
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
                <span className="relative z-10 flex items-center uppercase text-white/90 font-light">Enter Portal <ArrowRight className="ml-4 h-5 w-5 opacity-50 group-hover:opacity-100"/></span>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Features Showcase … (segue igual, sem alterações)**/}
      {/* … */}
