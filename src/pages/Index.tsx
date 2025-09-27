import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Sparkles, Calendar, Star } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/20 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-12">
              <div className="relative">
                <Crown className="h-32 w-32 text-primary drop-shadow-lg" />
                <Sparkles className="h-8 w-8 text-accent absolute -top-2 -right-2 animate-pulse" />
                <Sparkles className="h-6 w-6 text-secondary absolute -bottom-1 -left-1 animate-pulse delay-1000" />
              </div>
            </div>
            <div className="mb-8">
              <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
                Alice Gate Pass
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>
            <p className="text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
              Experience Entertainment Beyond Imagination
            </p>
            <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto">
              Everything you need for extraordinary events and unforgettable experiences
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Acessar Sistema
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Merchandise Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Curated Experiences
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover exclusive events and magical experiences
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-primary/20">
              <CardHeader className="text-center pb-4">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary group-hover:text-secondary transition-colors" />
                <CardTitle className="text-xl">Exclusive Events</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Limited access to the most sought-after entertainment experiences
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-primary/20">
              <CardHeader className="text-center pb-4">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-primary group-hover:text-secondary transition-colors" />
                <CardTitle className="text-xl">Curated Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Handpicked events tailored to your taste for extraordinary moments
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-primary/20">
              <CardHeader className="text-center pb-4">
                <Star className="h-16 w-16 mx-auto mb-4 text-primary group-hover:text-secondary transition-colors" />
                <CardTitle className="text-xl">VIP Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Premium experiences with behind-the-scenes access and exclusive perks
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Crown className="h-12 w-12 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Alice Gate Pass
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Alice Gate Pass. Crafting extraordinary experiences.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
