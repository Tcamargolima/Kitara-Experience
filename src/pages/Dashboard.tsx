import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Shield, LayoutDashboard, Users, ShoppingCart, Ticket } from "lucide-react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import SecurityTab from "@/components/dashboard/SecurityTab";
import { UserManagementTab } from "@/components/dashboard/UserManagementTab";
import ProductsTab from "@/components/dashboard/ProductsTab";
import AdminTab from "@/components/dashboard/AdminTab";
import { WhatsAppButton } from "@/components/support/WhatsAppButton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut, isAuthenticated, isAdmin, isClient, loading } = useSecureAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen kitara-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut();
    toast({
      title: "Desconectado",
      description: `Até logo, ${profile?.email || user?.email}!`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen kitara-bg flex items-center justify-center">
        <div className="text-center">
          <img src="/kitara/assets/logo.png" alt="KITARA logo" className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Conectando...</p>
        </div>
      </div>
    );
  }

  // Client interface
  if (isClient) {
    return (
      <div className="min-h-screen kitara-bg">
        <header className="kitara-header">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/kitara/assets/logo.png" alt="KITARA logo" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-cinzel text-secondary">KITARA</h1>
                <p className="text-sm text-muted-foreground">Portal do Cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.display_name || profile?.email || user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 kitara-button-outline">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="kitara-tabs">
              <TabsTrigger value="tickets" className="kitara-tab">
                <Ticket className="h-4 w-4 mr-2" />
                Ingressos
              </TabsTrigger>
              <TabsTrigger value="security" className="kitara-tab">
                <Shield className="h-4 w-4 mr-2" />
                Segurança
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="mt-6">
              <ProductsTab />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <SecurityTab userId={user?.id || ""} />
            </TabsContent>
          </Tabs>
        </main>

        {/* WhatsApp Support Button */}
        <WhatsAppButton />
      </div>
    );
  }

  // Admin interface
  return (
    <div className="min-h-screen kitara-bg">
      <header className="kitara-header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/kitara/assets/logo.png" alt="KITARA logo" className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-cinzel text-secondary">KITARA</h1>
              <p className="text-sm text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.display_name || profile?.email || user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 kitara-button-outline">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="kitara-tabs">
            <TabsTrigger value="overview" className="kitara-tab">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Painel
            </TabsTrigger>
            <TabsTrigger value="products" className="kitara-tab">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ingressos
            </TabsTrigger>
            <TabsTrigger value="users" className="kitara-tab">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="security" className="kitara-tab">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AdminTab />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityTab userId={user?.id || ""} />
          </TabsContent>
        </Tabs>
      </main>

      {/* WhatsApp Support Button */}
      <WhatsAppButton />
    </div>
  );
};

export default Dashboard;
