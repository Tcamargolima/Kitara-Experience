import { Card, CardContent } from "@/components/ui/card";
import { User, Smartphone, Lock } from "lucide-react";

interface SecurityStatsGridProps {
  totalUsers: number;
  total2FA: number;
  totalLocked: number;
}

const SecurityStatsGrid = ({ totalUsers, total2FA, totalLocked }: SecurityStatsGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="kitara-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
            <p className="text-3xl font-cinzel text-primary">{totalUsers}</p>
          </div>
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
    <Card className="kitara-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Com 2FA Ativo</p>
            <p className="text-3xl font-cinzel text-primary">{total2FA}</p>
          </div>
          <Smartphone className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
    <Card className="kitara-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Contas Bloqueadas</p>
            <p className="text-3xl font-cinzel text-destructive">{totalLocked}</p>
          </div>
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default SecurityStatsGrid;
