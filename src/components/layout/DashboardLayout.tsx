import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppButton } from "@/components/support/WhatsAppButton";

interface DashboardLayoutProps {
  children: ReactNode;
  subtitle: string;
}

const DashboardLayout = ({ children, subtitle }: DashboardLayoutProps) => {
  const { user, profile, signOut } = useSecureAuth();
  const { toast } = useToast();

  const handleSignOut = () => {
    signOut();
    toast({
      title: "Desconectado",
      description: `Até logo, ${profile?.display_name || profile?.email || user?.email}!`,
    });
  };

  return (
    <div className="min-h-screen kitara-bg">
      <header className="kitara-header sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/kitara/assets/logo.png"
              alt="KITARA logo"
              className="h-10 w-10 drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)]"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-cinzel text-secondary tracking-wide">
                KITARA
              </h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium truncate max-w-[200px]">
                {profile?.display_name || profile?.email || user?.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile?.role}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 kitara-button-outline"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>

      <WhatsAppButton />
    </div>
  );
};

export default DashboardLayout;
