import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, BarChart3, Ticket } from "lucide-react";
import type { AdminStats } from "@/lib/api";

interface AdminStatsGridProps {
  stats: AdminStats | null;
}

const AdminStatsGrid = ({ stats }: AdminStatsGridProps) => {
  const items = [
    { label: "Usuários", value: stats?.total_users || 0, icon: Users },
    { label: "Pedidos Pagos", value: stats?.total_paid_orders || 0, icon: CreditCard },
    { label: "Receita Total", value: `R$ ${(stats?.total_revenue || 0).toFixed(2)}`, icon: BarChart3 },
    { label: "Ingressos Ativos", value: stats?.total_tickets || 0, icon: Ticket },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="kitara-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatsGrid;
