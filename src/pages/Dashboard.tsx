import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, LayoutDashboard, Users, ShoppingCart, Ticket } from "lucide-react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { SecurityTab } from "@/components/dashboard/SecurityTab";
import { UserManagementTab } from "@/components/dashboard/UserManagementTab";
import ProductsTab from "@/components/dashboard/ProductsTab";
import AdminTab from "@/components/dashboard/AdminTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isClient, loading } = useSecureAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen kitara-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen kitara-bg flex items-center justify-center">
        <img src="/kitara/assets/logo.png" alt="KITARA" className="h-12 w-12 animate-pulse" />
      </div>
    );
  }

  // ─── Client View ───
  if (isClient) {
    return (
      <DashboardLayout subtitle="Portal do Cliente">
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
      </DashboardLayout>
    );
  }

  // ─── Admin View ───
  return (
    <DashboardLayout subtitle="Painel Administrativo">
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
    </DashboardLayout>
  );
};

export default Dashboard;
