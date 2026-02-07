import { Card, CardContent } from "@/components/ui/card";
import { User, Smartphone, Lock } from "lucide-react";

interface SecurityStatsGridProps {
  totalUsers: number;
  with2FA: number;
  locked: number;
}

const SecurityStatsGrid = ({ totalUsers, with2FA, locked }: SecurityStatsGridProps) => {
  const items = [
    { label: "Total de Usuários", value: totalUsers, icon: User, color: "text-primary" },
    { label: "Com 2FA Ativo", value: with2FA, icon: Smartphone, color: "text-primary" },
    { label: "Contas Bloqueadas", value: locked, icon: Lock, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="kitara-card animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className={`text-3xl font-cinzel ${color}`}>{value}</p>
              </div>
              <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SecurityStatsGrid;
