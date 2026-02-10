import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  adminGetStats, adminGetUsers, adminGetTickets,
  type AdminStats, type UserProfile, type Ticket,
} from "@/lib/api";
import AdminStatsGrid from "./AdminStatsGrid";
import CreateTicketDialog from "./CreateTicketDialog";
import CreateCouponDialog from "./CreateCouponDialog";
import CreateInviteDialog from "./CreateInviteDialog";

const AdminTab = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, u, t] = await Promise.all([adminGetStats(), adminGetUsers(), adminGetTickets()]);
      setStats(s);
      setUsers(Array.isArray(u) ? u : []);
      setTickets(Array.isArray(t) ? t : []);
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-cinzel text-secondary">Painel Administrativo</h2>
        <p className="text-muted-foreground">Visão geral e gerenciamento via RPCs seguras</p>
      </div>

      <AdminStatsGrid stats={stats} />

      <div className="flex flex-wrap gap-4">
        <CreateTicketDialog onCreated={fetchData} />
        <CreateCouponDialog onCreated={fetchData} />
        <CreateInviteDialog onCreated={fetchData} />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="tickets">Ingressos</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card className="kitara-card">
            <CardHeader>
              <CardTitle className="font-cinzel text-secondary">Usuários ({users.length})</CardTitle>
              <CardDescription>Dados obtidos via RPC admin_get_users</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhum usuário encontrado</p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.display_name || "Sem nome"} • MFA: {user.mfa_enabled ? "✓" : "✗"}
                        </p>
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <Card className="kitara-card">
            <CardHeader>
              <CardTitle className="font-cinzel text-secondary">Ingressos ({tickets.length})</CardTitle>
              <CardDescription>Dados obtidos via RPC admin_get_tickets</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhum ingresso encontrado</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-background/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{ticket.name}</CardTitle>
                        {ticket.description && <CardDescription>{ticket.description}</CardDescription>}
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-primary font-bold">R$ {ticket.price.toFixed(2)}</span>
                          <Badge variant={ticket.stock > 0 ? "default" : "destructive"}>Estoque: {ticket.stock}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTab;
