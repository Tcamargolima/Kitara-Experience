import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, CreditCard, QrCode, AlertTriangle, BarChart3 } from "lucide-react";
import { UserManagementTab } from "./UserManagementTab";

interface Stats {
  totalUsers: number;
  totalTickets: number;
  totalSubscriptions: number;
  totalAccesses: number;
  totalPendencies: number;
}

const AdminTab = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTickets: 0,
    totalSubscriptions: 0,
    totalAccesses: 0,
    totalPendencies: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const [usersResult, ticketsResult, subscriptionsResult, accessesResult, pendenciesResult] = await Promise.all([
        (supabase as any).from("usuarios_blankapp").select("id", { count: "exact", head: true }),
        (supabase as any).from("tickets_blankapp").select("id", { count: "exact", head: true }),
        (supabase as any).from("assinaturas_blankapp").select("id", { count: "exact", head: true }),
        (supabase as any).from("acessos_blankapp").select("id", { count: "exact", head: true }),
        (supabase as any).from("pendencias_blankapp").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalTickets: ticketsResult.count || 0,
        totalSubscriptions: subscriptionsResult.count || 0,
        totalAccesses: accessesResult.count || 0,
        totalPendencies: pendenciesResult.count || 0,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Carregando painel administrativo...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Painel Administrativo</h2>
        <p className="text-muted-foreground">Visão geral do sistema e estatísticas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total de usuários registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingressos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">Total de ingressos criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Total de assinaturas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccesses}</div>
            <p className="text-xs text-muted-foreground">Total de acessos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPendencies}</div>
            <p className="text-xs text-muted-foreground">Pendências abertas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="user-management">Aprovação</TabsTrigger>
          <TabsTrigger value="tickets">Ingressos</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Sistema</CardTitle>
              <CardDescription>Informações importantes sobre o estado atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Status Geral</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Sistema Ativo</Badge>
                    <Badge variant="secondary">Todos os Serviços Online</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Últimas Atividades</h4>
                  <p className="text-sm text-muted-foreground">
                    Sistema funcionando normalmente. Todas as funcionalidades estão operacionais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>Visualização geral de todos os usuários do sistema</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="user-management" className="mt-6">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Ingressos</CardTitle>
              <CardDescription>Visualizar e gerenciar todos os ingressos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidades de gerenciamento de ingressos estarão disponíveis em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Assinaturas</CardTitle>
              <CardDescription>Visualizar e gerenciar todas as assinaturas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidades de gerenciamento de assinaturas estarão disponíveis em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTab;