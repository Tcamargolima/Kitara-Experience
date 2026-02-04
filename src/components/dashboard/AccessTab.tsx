import { useState, useEffect } from "react";
import { getMyAccesses, type Order } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Clock, CheckCircle, XCircle, Ticket } from "lucide-react";

interface AccessTabProps {
  userId: string;
}

/**
 * AccessTab displays the user's purchased tickets/accesses
 * Uses RPC get_my_accesses - NO direct supabase.from()
 */
const AccessTab = ({ userId }: AccessTabProps) => {
  const [accesses, setAccesses] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccesses = async () => {
    try {
      const data = await getMyAccesses();
      setAccesses(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar acessos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccesses();
  }, [userId]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      paid: { 
        variant: "default" as const, 
        label: "Pago", 
        icon: CheckCircle 
      },
      pending: { 
        variant: "secondary" as const, 
        label: "Pendente", 
        icon: Clock 
      },
      cancelled: { 
        variant: "destructive" as const, 
        label: "Cancelado", 
        icon: XCircle 
      },
      refunded: { 
        variant: "outline" as const, 
        label: "Reembolsado", 
        icon: XCircle 
      },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const IconComponent = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Carregando acessos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-cinzel text-secondary">Meus Acessos</h2>
        <p className="text-muted-foreground">Histórico de compras e ingressos</p>
      </div>

      {accesses.length === 0 ? (
        <Card className="kitara-card">
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum acesso registrado</h3>
            <p className="text-muted-foreground">
              Seus ingressos comprados aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {accesses.map((access) => (
            <Card key={access.order_id} className="kitara-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-cinzel text-secondary">
                      {access.ticket_name}
                    </CardTitle>
                    {access.ticket_description && (
                      <CardDescription>
                        {access.ticket_description}
                      </CardDescription>
                    )}
                  </div>
                  {getStatusBadge(access.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Ticket className="h-4 w-4" />
                  Quantidade: {access.quantity}
                </div>
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                  Valor: {formatCurrency(access.final_price)}
                </div>
                {access.event_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Data do evento: {formatDateTime(access.event_date)}
                  </div>
                )}
                {access.paid_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    Pago em: {formatDateTime(access.paid_at)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessTab;