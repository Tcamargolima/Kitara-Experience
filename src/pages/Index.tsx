import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tent, Sparkles, Calendar, Star, PartyPopper, Users, Ticket } from "lucide-react";
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
    <div className="min-h-screen circus-bg">
      <InstallPrompt />
      <IOSInstallInstructions />
      
      {/* Hero Section */}
      <section className="relative circus-stars min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-12 relative">
              <div className="relative animate-bounce-in">
                <Tent className="h-32 w-32 text-primary drop-shadow-lg animate-pulse" />
                <PartyPopper className="h-8 w-8 text-accent absolute -top-2 -right-2 animate-spin" />
                <Sparkles className="h-6 w-6 text-secondary absolute -bottom-1 -left-1 animate-pulse delay-1000" />
                <Star className="h-4 w-4 text-secondary absolute top-2 left-2 animate-pulse delay-500" />
              </div>
            </div>
            <div className="mb-8">
              <h1 className="circus-title font-bungee mb-6">
                MOSKINO
              </h1>
              <div className="w-48 h-2 bg-gradient-to-r from-secondary via-accent to-primary mx-auto rounded-full shadow-lg"></div>
              <p className="text-xl font-fredoka font-medium text-primary mt-4 tracking-wide uppercase">
                🎪 Grande Espetáculo Circense 🎪
              </p>
            </div>
            <p className="text-2xl text-foreground mb-8 leading-relaxed max-w-3xl mx-auto font-fredoka font-medium">
              A Magia do Circo em suas Mãos!
            </p>
            <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto font-fredoka">
              Ingressos para espetáculos únicos e inesquecíveis. Venha viver momentos mágicos no universo circense!
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg"
                className="circus-button font-fredoka font-bold text-xl px-12 py-6 text-background"
              >
                🎭 Entrar no Circo 🎭
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Attractions Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="circus-title text-5xl font-bungee mb-6">
              Atrações Espetaculares
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-fredoka font-medium">
              Descubra as maravilhas que o Circo MOSKINO reserva para você
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="circus-card group hover:shadow-xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1">
              <CardHeader className="text-center pb-4">
                <PartyPopper className="h-20 w-20 mx-auto mb-4 text-accent group-hover:animate-spin transition-all duration-500" />
                <CardTitle className="text-2xl font-fredoka font-bold text-primary">Espetáculos Únicos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center font-fredoka text-base leading-relaxed">
                  Apresentações exclusivas com artistas renomados de todo o mundo
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="circus-card group hover:shadow-xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1">
              <CardHeader className="text-center pb-4">
                <Ticket className="h-20 w-20 mx-auto mb-4 text-secondary group-hover:animate-bounce transition-all duration-500" />
                <CardTitle className="text-2xl font-fredoka font-bold text-primary">Ingressos Especiais</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center font-fredoka text-base leading-relaxed">
                  Diferentes categorias de ingressos para você viver a magia de pertinho
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="circus-card group hover:shadow-xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1">
              <CardHeader className="text-center pb-4">
                <Users className="h-20 w-20 mx-auto mb-4 text-accent group-hover:animate-pulse transition-all duration-500" />
                <CardTitle className="text-2xl font-fredoka font-bold text-primary">Experiência VIP</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center font-fredoka text-base leading-relaxed">
                  Acesso aos bastidores e encontro exclusivo com os artistas
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-16 bg-gradient-to-r from-primary via-primary to-secondary relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-primary/5 bg-repeat" style={{backgroundImage: "radial-gradient(circle at 50% 50%, hsl(var(--secondary)) 2px, transparent 2px)", backgroundSize: "20px 20px"}}></div>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-xl mx-auto">
            <div className="flex justify-center items-center gap-4 mb-6">
              <Tent className="h-16 w-16 text-secondary animate-pulse" />
              <span className="text-3xl font-bungee text-secondary">
                MOSKINO
              </span>
            </div>
            <p className="text-secondary/80 text-lg font-fredoka font-medium">
              🎪 Onde a magia acontece todos os dias 🎪
            </p>
            <p className="text-secondary/60 text-sm font-fredoka mt-4">
              © 2024 Circo MOSKINO. Criando momentos inesquecíveis desde sempre.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
