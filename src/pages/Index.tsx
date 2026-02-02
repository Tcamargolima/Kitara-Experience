import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Sparkles, ArrowRight, Shield, Database, Lock } from "lucide-react";
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
    <div className="min-h-screen kitara-bg">
      <InstallPrompt />
      <IOSInstallInstructions />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="kitara-noise" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-12 relative">
              <div className="relative">
                <Zap className="h-32 w-32 text-primary drop-shadow-lg" />
                <Sparkles className="h-8 w-8 text-secondary absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <div className="mb-8">
              <h1 className="kitara-title font-cinzel mb-6">
                KITARA
              </h1>
              <div className="w-48 h-1 bg-gradient-to-r from-secondary via-primary to-secondary mx-auto rounded-full shadow-lg"></div>
              <p className="text-xl text-secondary mt-4 tracking-wide uppercase font-cinzel">
                Next Generation Platform
              </p>
            </div>
            <p className="text-2xl text-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Secure, Fast, and Powerful
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Experience the future of digital management with enterprise-grade security and elegant design.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg"
                className="kitara-button text-xl px-12 py-6"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="kitara-title text-4xl font-cinzel mb-6">
              Key Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built with security and performance in mind
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="kitara-card group hover:shadow-xl transition-all duration-500 hover:-translate-y-4">
              <CardHeader className="text-center pb-4">
                <Shield className="h-20 w-20 mx-auto mb-4 text-primary group-hover:text-secondary transition-colors" />
                <CardTitle className="text-2xl font-cinzel text-secondary">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  Row-level security, encrypted data, and secure authentication
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="kitara-card group hover:shadow-xl transition-all duration-500 hover:-translate-y-4">
              <CardHeader className="text-center pb-4">
                <Database className="h-20 w-20 mx-auto mb-4 text-primary group-hover:text-secondary transition-colors" />
                <CardTitle className="text-2xl font-cinzel text-secondary">Real-time Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  Instant synchronization across all devices and users
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="kitara-card group hover:shadow-xl transition-all duration-500 hover:-translate-y-4">
              <CardHeader className="text-center pb-4">
                <Lock className="h-20 w-20 mx-auto mb-4 text-primary group-hover:text-secondary transition-colors" />
                <CardTitle className="text-2xl font-cinzel text-secondary">Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  Fine-grained permissions and role management
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-16 kitara-footer relative">
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-xl mx-auto">
            <div className="flex justify-center items-center gap-4 mb-6">
              <Zap className="h-16 w-16 text-primary" />
              <span className="text-3xl font-cinzel text-secondary">
                KITARA
              </span>
            </div>
            <p className="text-muted-foreground text-lg">
              Powered by cutting-edge technology
            </p>
            <p className="text-muted-foreground text-sm mt-4">
              © 2024 KITARA. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
