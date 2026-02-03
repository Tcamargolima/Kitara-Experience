import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, Shield, Database, Lock } from "lucide-react";
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
    <div className="min-h-screen kitara-bg relative overflow-x-hidden selection:bg-secondary/30 selection:text-secondary">
      {/* Ambient Background Glows - Adiciona profundidade premium */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="relative z-50">
        <InstallPrompt />
        <IOSInstallInstructions />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-20">
        <div className="kitara-noise opacity-50 mix-blend-overlay" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto flex flex-col items-center">
            
            {/* Image Container with Glow Effect */}
            <div className="relative mb-16 group cursor-pointer transition-transform duration-700 hover:scale-105">
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl group-hover:bg-secondary/30 transition-all duration-700" />
              <div className="relative">
                <img 
                  src="/kitara/assets/mentor.png" 
                  alt="Kitara Mentor" 
                  className="h-40 w-40 md:h-48 md:w-48 object-contain drop-shadow-2xl z-10 relative" 
                />
                <Sparkles className="h-10 w-10 text-secondary absolute -top-4 -right-4 animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              </div>
            </div>

            <div className="mb-10 space-y-6">
              <h1 className="kitara-title font-cinzel text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50 drop-shadow-sm">
                KITARA
              </h1>
              
              <div className="flex items-center justify-center gap-4 opacity-80">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-secondary"></div>
                <p className="text-sm md:text-lg text-secondary tracking-[0.3em] uppercase font-cinzel font-light">
                  Next Generation Platform
                </p>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-secondary"></div>
              </div>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto backdrop-blur-sm bg-black/5 p-6 rounded-3xl border border-white/5">
              <p className="text-2xl md:text-3xl text-foreground font-light leading-relaxed">
                Secure. <span className="text-secondary font-normal">Fast.</span> Powerful.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
                Experience the future of digital management with enterprise-grade security and elegant design defined by exclusivity.
              </p>
            </div>

            <div className="mt-12">
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg" 
                className="kitara-button group relative overflow-hidden rounded-full px-10 py-8 text-lg font-cinzel tracking-wider border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-4xl font-cinzel text-white/90">Key Features</h2>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
            <p className="text-muted-foreground font-light tracking-wide">Built with uncompromised security and performance</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="group relative overflow-hidden border-white/5 bg-black/20 backdrop-blur-xl hover:bg-black/40 transition-all duration-500 hover:-translate-y-2 hover:border-secondary/30 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-6 relative z-10">
                <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center border border-white/5 group-hover:border-secondary/50 transition-colors duration-500">
                  <Shield className="h-8 w-8 text-white/70 group-hover:text-secondary transition-colors duration-500" />
                </div>
                <CardTitle className="text-xl font-cinzel text-white/90 tracking-wide">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-center text-muted-foreground/80 leading-relaxed group-hover:text-white/70 transition-colors duration-500">
                  Row-level security, encrypted data, and secure authentication protocols.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative overflow-hidden border-white/5 bg-black/20 backdrop-blur-xl hover:bg-black/40 transition-all duration-500 hover:-translate-y-2 hover:border-secondary/30 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
               <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-6 relative z-10">
                <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center border border-white/5 group-hover:border-secondary/50 transition-colors duration-500">
                  <Database className="h-8 w-8 text-white/70 group-hover:text-secondary transition-colors duration-500" />
                </div>
                <CardTitle className="text-xl font-cinzel text-white/90 tracking-wide">Real-time Data</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-center text-muted-foreground/80 leading-relaxed group-hover:text-white/70 transition-colors duration-500">
                  Instant synchronization across all devices ensuring you never miss a beat.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative overflow-hidden border-white/5 bg-black/20 backdrop-blur-xl hover:bg-black/40 transition-all duration-500 hover:-translate-y-2 hover:border-secondary/30 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
               <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-6 relative z-10">
                <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center border border-white/5 group-hover:border-secondary/50 transition-colors duration-500">
                  <Lock className="h-8 w-8 text-white/70 group-hover:text-secondary transition-colors duration-500" />
                </div>
                <CardTitle className="text-xl font-cinzel text-white/90 tracking-wide">Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-center text-muted-foreground/80 leading-relaxed group-hover:text-white/70 transition-colors duration-500">
                  Fine-grained permissions and elite role management for your organization.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-16 relative border-t border-white/5 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-xl mx-auto flex flex-col items-center">
            <div className="flex justify-center items-center gap-4 mb-8 opacity-90 hover:opacity-100 transition-opacity duration-300">
              <img src="/kitara/assets/logo.png" alt="KITARA logo" className="h-12 w-12 opacity-80" />
              <span className="text-2xl font-cinzel text-white tracking-widest">KITARA</span>
            </div>
            <p className="text-muted-foreground text-sm font-light tracking-wide mb-2">Powered by cutting-edge technology</p>
            <p className="text-white/20 text-xs mt-4 font-cinzel">© 2024 KITARA. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
