import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Settings, Shield, LayoutDashboard, Users, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TicketsTab from "@/components/dashboard/TicketsTab";
import SubscriptionsTab from "@/components/dashboard/SubscriptionsTab";
import { SecurityTab } from "@/components/dashboard/SecurityTab";
import { UserManagementTab } from "@/components/dashboard/UserManagementTab";
import ProductsTab from "@/components/dashboard/ProductsTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, userRole, signOut, isAuthenticated, loading } = useAuth();

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
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut();
    toast({
      title: "Signed out",
      description: `See you later, ${profile?.email || user?.email}!`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen kitara-bg flex items-center justify-center">
        <div className="text-center">
          <img src="/kitara/assets/logo.png" alt="KITARA logo" className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  // Client interface
  if (userRole === "client") {
    return (
      <div className="min-h-screen kitara-bg">
        <header className="kitara-header">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/kitara/assets/logo.png" alt="KITARA logo" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-cinzel text-secondary">KITARA</h1>
                <p className="text-sm text-muted-foreground">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.email || user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 kitara-button-outline">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="kitara-tabs">
              <TabsTrigger value="overview" className="kitara-tab">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="security" className="kitara-tab">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <TicketsTab userId={user.id} />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <SecurityTab userId={user.id} />
            </TabsContent>
          </Tabs>
        </main>
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
              <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.email || user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 kitara-button-outline">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="kitara-tabs">
            <TabsTrigger value="overview" className="kitara-tab">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="kitara-tab">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="kitara-tab">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="security" className="kitara-tab">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="kitara-card">
              <CardContent className="py-16 text-center">
                <img src="/kitara/assets/mentor.png" alt="Kitara Mentor" className="h-32 w-32 mx-auto mb-6 drop-shadow-lg" />
                <h2 className="text-3xl font-cinzel text-secondary mb-4">Welcome to KITARA</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Your premium platform for secure management, products, and user administration.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
