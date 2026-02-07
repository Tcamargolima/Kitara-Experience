import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  adminGetStats,
  adminGetUsers,
  adminGetTickets,
  adminCreateTicket,
  adminCreateCoupon,
  adminCreateInvite,
  type AdminStats,
  type UserProfile,
  type Ticket as TicketType,
} from "@/lib/api";
import AdminStatsGrid from "./AdminStatsGrid";
import CreateTicketDialog from "./CreateTicketDialog";
import CreateCouponDialog from "./CreateCouponDialog";
import CreateInviteDialog from "./CreateInviteDialog";
const AdminTab = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Dialog states
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Form states
  const [ticketForm, setTicketForm] = useState({ name: "", description: "", price: "", stock: "" });
  const [couponForm, setCouponForm] = useState({ code: "", discountPercent: "", maxUses: "" });
  const [inviteForm, setInviteForm] = useState({ maxUses: "1" });
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, ticketsData] = await Promise.all([
        adminGetStats(),
        adminGetUsers(),
        adminGetTickets(),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setTickets(ticketsData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTicket = async () => {
    if (!ticketForm.name || !ticketForm.price) {
      toast({ title: "Erro", description: "Nome e preço são obrigatórios.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const result = await adminCreateTicket(
        ticketForm.name,
        ticketForm.description,
        parseFloat(ticketForm.price),
        parseInt(ticketForm.stock) || 0
      );

      if (result.success) {
        toast({ title: "Sucesso", description: "Ingresso criado!" });
        setTicketDialogOpen(false);
        setTicketForm({ name: "", description: "", price: "", stock: "" });
        fetchData();
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!couponForm.code) {
      toast({ title: "Erro", description: "Código é obrigatório.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const result = await adminCreateCoupon(
        couponForm.code,
        couponForm.discountPercent ? parseInt(couponForm.discountPercent) : undefined,
        undefined,
        couponForm.maxUses ? parseInt(couponForm.maxUses) : undefined
      );

      if (result.success) {
        toast({ title: "Sucesso", description: "Cupom criado!" });
        setCouponDialogOpen(false);
        setCouponForm({ code: "", discountPercent: "", maxUses: "" });
        fetchData();
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateInvite = async () => {
    setSubmitting(true);
    try {
      const result = await adminCreateInvite(parseInt(inviteForm.maxUses) || 1);

      if (result.success && result.code) {
        setGeneratedInvite(result.code);
        toast({ title: "Sucesso", description: `Convite gerado: ${result.code}` });
        fetchData();
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-cinzel text-secondary">Painel Administrativo</h2>
        <p className="text-muted-foreground">Visão geral e gerenciamento via RPCs seguras</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="kitara-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.total_users || 0}</div>
          </CardContent>
        </Card>

        <Card className="kitara-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pagos</CardTitle>
            <CreditCard className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.total_paid_orders || 0}</div>
          </CardContent>
        </Card>

        <Card className="kitara-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {(stats?.total_revenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="kitara-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingressos Ativos</CardTitle>
            <Ticket className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.total_tickets || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {/* Create Ticket Dialog */}
        <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
          <DialogTrigger asChild>
            <Button className="kitara-button">
              <Ticket className="mr-2 h-4 w-4" />
              Criar Ingresso
            </Button>
          </DialogTrigger>
          <DialogContent className="kitara-card">
            <DialogHeader>
              <DialogTitle className="font-cinzel text-secondary">Novo Ingresso</DialogTitle>
              <DialogDescription>Crie um novo ingresso para venda</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                  className="kitara-input"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="kitara-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={ticketForm.price}
                    onChange={(e) => setTicketForm({ ...ticketForm, price: e.target.value })}
                    className="kitara-input"
                  />
                </div>
                <div>
                  <Label>Estoque</Label>
                  <Input
                    type="number"
                    value={ticketForm.stock}
                    onChange={(e) => setTicketForm({ ...ticketForm, stock: e.target.value })}
                    className="kitara-input"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTicket} disabled={submitting} className="kitara-button">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Coupon Dialog */}
        <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
              <Gift className="mr-2 h-4 w-4" />
              Criar Cupom Elixir
            </Button>
          </DialogTrigger>
          <DialogContent className="kitara-card">
            <DialogHeader>
              <DialogTitle className="font-cinzel text-secondary">Novo Cupom Elixir</DialogTitle>
              <DialogDescription>Crie um código de desconto</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Código</Label>
                <Input
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="kitara-input"
                  placeholder="ELIXIR2024"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={couponForm.discountPercent}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercent: e.target.value })}
                    className="kitara-input"
                  />
                </div>
                <div>
                  <Label>Usos Máximos</Label>
                  <Input
                    type="number"
                    value={couponForm.maxUses}
                    onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                    className="kitara-input"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateCoupon} disabled={submitting} className="kitara-button">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={(open) => {
          setInviteDialogOpen(open);
          if (!open) setGeneratedInvite(null);
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
              <Key className="mr-2 h-4 w-4" />
              Gerar Convite
            </Button>
          </DialogTrigger>
          <DialogContent className="kitara-card">
            <DialogHeader>
              <DialogTitle className="font-cinzel text-secondary">Gerar Código de Convite</DialogTitle>
              <DialogDescription>Crie um código para novos usuários</DialogDescription>
            </DialogHeader>
            {generatedInvite ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Código gerado:</p>
                <p className="text-2xl font-mono text-primary tracking-widest">{generatedInvite}</p>
                <p className="text-xs text-muted-foreground mt-2">Compartilhe este código com o convidado</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Usos Máximos</Label>
                  <Input
                    type="number"
                    min="1"
                    value={inviteForm.maxUses}
                    onChange={(e) => setInviteForm({ ...inviteForm, maxUses: e.target.value })}
                    className="kitara-input"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              {!generatedInvite && (
                <Button onClick={handleCreateInvite} disabled={submitting} className="kitara-button">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Gerar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
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
                      <Badge variant={user.role === "admin" ? "default" : "outline"}>
                        {user.role}
                      </Badge>
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
                        {ticket.description && (
                          <CardDescription>{ticket.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-primary font-bold">R$ {ticket.price.toFixed(2)}</span>
                          <Badge variant={ticket.stock > 0 ? "default" : "destructive"}>
                            Estoque: {ticket.stock}
                          </Badge>
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
