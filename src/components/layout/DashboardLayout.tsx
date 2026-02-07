import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";
import WhatsAppButton from "@/components/support/WhatsAppButton";

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
      description: `Até logo, ${profile?.display_name || user?.email}`,
    });
  };

  return (
    <div className="min-h-screen kitara-bg">
      <header className="kitara-header sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/kitara/assets/logo.png" className="h-10" />
            <div>
              <h1 className="font-cinzel text-secondary text-xl">KITARA</h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="kitara-button-outline gap-2"
          >
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <WhatsAppButton />
    </div>
  );
};

export default DashboardLayout;