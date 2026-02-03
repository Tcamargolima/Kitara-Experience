import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, Shield, Database, Lock, Crown, Star } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallInstructions } from "@/components/pwa/iOSInstallInstructions";

const Index = () => {
  const [user, setUser] = useState(null);
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
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen kitara-bg relative overflow-x-hidden selection:bg-secondary/20 selection:text-secondary">
      {/* Ambient Background - Deep Luxury Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[150px] opacity-30 animate-pulse" />
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>

      <div className="relative z-50">
        <InstallPrompt />
        <IOSInstallInstructions />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-20">
        <div className="kitara-noise opacity-30 mix-blend-soft-light" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto flex flex-col items-center">
            
            {/* EXCLUSIVE BADGE - O Selo de Membros */}
            <div className="mb-12 animate-fade-in-down">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/20 bg-secondary/5 backdrop-blur-md">
                <Crown className="w-3 h-3 text-secondary" />
                <span className="text-[10px] md:text-xs font-cinzel tracking-[0.3em] text-secondary/80 uppercase">
                  Members Only • Select Access
                </span>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative mb-12 group cursor-pointer transition-transform duration-1000 hover:scale-105">
              <div className="absolute inset-0 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700" />
              <div className="relative">
                <img 
                  src="/kitara/assets/mentor.png" 
                  alt="Kitara Mentor" 
                  className="h-32 w-32 md:h-44 md:w-44 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 relative opacity-90 group-hover:opacity-100 transition-opacity" 
                />
                <Sparkles className="h-6 w-6 text-secondary/60 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>

            {/* Main Typography */}
            <div className="mb-10 space-y-4">
              <h1 className="kitara-title font-cinzel text-6xl md:text-8xl lg:text-9xl font-medium tracking-tighter text-white drop-shadow-lg">
                KITARA
              </h1>
              
              <div className="flex flex-col items-center gap-3">
                 <p className="text-sm md:text-lg text-secondary/70 tracking-[0.5em] uppercase font-cinzel font-light border-b border-secondary/10 pb-2">
                  The Sanctuary of Digital Assets
                </p>
              </div>
            </div>

            {/* The "Experience" Copy */}
            <div className="space-y-8 max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-4xl text-white/90 font-light leading-tight font-cinzel">
                Curating the <span className="italic text-secondary">Almost Incredible.</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed font-light font-sans tracking-wide">
                Where elite performance meets uncompromising privacy. 
                Designed exclusively for those who demand a digital experience beyond the ordinary.
              </p>
            </div>

            {/* Action Button */}
            <div>
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg" 
                className="kitara-button group relative overflow-hidden rounded-none px-12 py-8 text-sm md:text-base font-cinzel tracking-[0.2em] border border-white/10 bg-black/40 hover:bg-white/5 backdrop-blur-md transition-all duration-700 hover:border-secondary/40"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-secondary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center uppercase text-white/90 group-hover:text-white">
                  Enter The Portal
                  <ArrowRight className="ml-3 h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />
                </span>
              </Button>
              <p className="mt-4 text-[10px] text-white/20 tracking-widest uppercase font-cinzel">
                Invitation Required
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section - "The Pillars of Exclusivity" */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 relative z-10">
          
          <div className="text-center mb-24">
            <span className="text-secondary/50 text-xs tracking-[0.4em] uppercase font-cinzel block mb-4">Why Kitara?</span>
            <h2 className="text-3xl md:text-5xl font-cinzel text-white font-medium">The Art of Exclusivity</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="group relative overflow-hidden border-white/5 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm transition-all duration-700 hover:-translate-y-1 hover:border-white/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <CardHeader className="text-center pt-10 pb-2 relative z-10">
                <Shield className="h-8 w-8 mx-auto mb-6 text-white/40 group-hover:text-secondary transition-colors duration-500 stroke-[1px]" />
                <CardTitle className="text-lg font-cinzel text-white/80 tracking-widest uppercase">Fortified Sanctuary</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pb-10">
                <CardDescription className="text-center text-muted-foreground/60 text-sm leading-relaxed font-light">
                  Enterprise-grade encryption wrapped in a private environment. Your data, invisible to the world.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative overflow-hidden border-white/5 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm transition-all duration-700 hover:-translate-y-1 hover:border-white/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <CardHeader className="text-center pt-10 pb-2 relative z-10">
                <Star className="h-8 w-8 mx-auto mb-6 text-white/40 group-hover:text-secondary transition-colors duration-500 stroke-[1px]" />
                <CardTitle className="text-lg font-cinzel text-white/80 tracking-widest uppercase">Premium Velocity</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pb-10">
                <CardDescription className="text-center text-muted-foreground/60 text-sm leading-relaxed font-light">
                  Real-time synchronization engine designed for instant interactions. No latency, just fluidity.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative overflow-hidden border-white/5 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm transition-all duration-700 hover:-translate-y-1 hover:border-white/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <CardHeader className="text-center pt-10 pb-2 relative z-10">
                <Lock className="h-8 w-8 mx-auto mb-6 text-white/40 group-hover:text-secondary transition-colors duration-500 stroke-[1px]" />
                <CardTitle className="text-lg font-cinzel text-white/80 tracking-widest uppercase">Sovereign Control</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pb-10">
                <CardDescription className="text-center text-muted-foreground/60 text-sm leading-relaxed font-light">
                  Absolute authority over permissions. Role-based access crafted for hierarchy and order.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-20 relative border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-xl mx-auto flex flex-col items-center">
            <div className="flex justify-center items-center gap-4 mb-8 opacity-70 hover:opacity-100 transition-opacity duration-500 cursor-default">
              <img src="/kitara/assets/logo.png" alt="KITARA logo" className="h-10 w-10 grayscale hover:grayscale-0 transition-all duration-500" />
              <span className="text-xl font-cinzel text-white/80 tracking-[0.2em]">KITARA</span>
            </div>
            <p className="text-muted-foreground/40 text-xs font-cinzel tracking-wider mb-2">Defining the Standard of Digital Luxury</p>
            <div className="w-12 h-[1px] bg-white/10 my-6"></div>
            <p className="text-white/10 text-[10px] uppercase tracking-widest">© 2024 KITARA. Private & Confidential.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
