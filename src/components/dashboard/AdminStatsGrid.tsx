import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, BarChart3, Ticket } from "lucide-react";
import { AdminStats } from "@/lib/api";

interface AdminStatsGridProps {
  stats: AdminStats | null;
}

const AdminStatsGrid = ({ stats }: AdminStatsGridProps) => (
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
        <div className="text-2xl font-bold text-primary">R$ {(stats?.total_revenue || 0).toFixed(2)}</div>
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
);

export default AdminStatsGrid;
