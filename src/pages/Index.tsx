import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shield, Star, Lock, Crown } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallInstructions } from "@/components/pwa/iOSInstallInstructions";

const Index = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/dashboard");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });

    setTimeout(() => setIsLoaded(true), 100);
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden text-white selection:bg-secondary/30">

      {/* 🎥 Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/kitara-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay for contrast */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/60 via-black/75 to-black/90 backdrop-blur-[2px]" />

      <div className="relative z-50">
        <InstallPrompt />
        <IOSInstallInstructions />
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="relative z-20 max-w-6xl text-center space-y-16">

          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#C5A059]/30 bg-white/[0.06] backdrop-blur-xl">
              <Crown className="w-4 h-4 text-[#C5A059]" />
              <span className="text-xs tracking-[0.4em] font-cinzel text-[#C5A059] uppercase">
                Members Only • Invitation Required
              </span>
            </div>
          </div>

          {/* Video Showcase */}
          <div className="rounded-[3rem] overflow-hidden border border-[#C5A059]/25 bg-white/[0.06] backdrop-blur-xl shadow-2xl">
            <video
              src="https://eickxhgarnwzovgdlujq.supabase.co/storage/v1/object/public/kitara_public/kitara-show1.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Brand */}
          <div className="space-y-8">
            <h1 className="font-cinzel text-7xl md:text-9xl tracking-[0.3em]">
              KITARA
            </h1>
            <p className="text-secondary/70 tracking-[0.5em] uppercase text-sm font-cinzel">
              Digital Sanctuary
            </p>
          </div>

          {/* Message */}
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-light">
              Curating the <span className="text-secondary">Almost Incredible</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              An exclusive digital experience where elite performance converges with uncompromising privacy.
            </p>
          </div>

          {/* CTA */}
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="rounded-full px-16 py-8 font-cinzel tracking-[0.3em] bg-white/[0.08] border border-[#C5A059]/30 backdrop-blur-xl hover:bg-white/[0.15] transition-all"
          >
            Enter Portal <ArrowRight className="ml-4" />
          </Button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-40 relative z-20">
        <div className="container mx-auto grid gap-12 md:grid-cols-3 px-6">

          {[
            {
              icon: <Shield className="w-10 h-10 text-[#C5A059]" />,
              title: "Fortified Sanctuary",
              desc: "Military-grade encryption within a sovereign digital fortress.",
            },
            {
              icon: <Star className="w-10 h-10 text-[#C5A059]" />,
              title: "Quantum Velocity",
              desc: "Zero-latency synchronization architecture.",
            },
            {
              icon: <Lock className="w-10 h-10 text-[#C5A059]" />,
              title: "Sovereign Dominion",
              desc: "Absolute command over access hierarchies.",
            },
          ].map((f, i) => (
            <Card key={i} className="bg-white/[0.06] backdrop-blur-xl border border-[#C5A059]/20">
              <CardHeader className="text-center space-y-6 pt-16">
                {f.icon}
                <CardTitle className="font-cinzel tracking-[0.25em] uppercase">
                  {f.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-16 px-10">
                <CardDescription className="text-center text-muted-foreground">
                  {f.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}

        </div>
      </section>

      {/* FOOTER */}
      <section className="py-24 text-center border-t border-white/10 relative z-20">
        <div className="space-y-6">
          <p className="font-cinzel tracking-[0.3em] text-white/60">KITARA</p>
          <p className="text-white/20 text-xs tracking-[0.5em]">Redefining Digital Luxury</p>
        </div>
      </section>
    </div>
  );
};

export default Index;
