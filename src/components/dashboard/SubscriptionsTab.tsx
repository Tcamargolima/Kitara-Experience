import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Plus, Calendar, Clock } from "lucide-react";
import CreateSubscriptionDialog from "./CreateSubscriptionDialog";

interface Subscription {
  id: string;
  plano: string;
  valor: number;
  duracao: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  renovacao_automatica: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface SubscriptionsTabProps {
  userId: string;
}

const SubscriptionsTab = ({ userId }: SubscriptionsTabProps) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar assinaturas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [userId]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ativa: { variant: "default" as const, label: "Ativa" },
      inativa: { variant: "secondary" as const, label: "Inativa" },
      cancelada: { variant: "destructive" as const, label: "Cancelada" },
      expirada: { variant: "outline" as const, label: "Expirada" },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.inativa;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getDurationLabel = (duration: string) => {
    const durationMap = {
      mensal: "Mensal",
      trimestral: "Trimestral",
      semestral: "Semestral",
      anual: "Anual",
    };
    
    return durationMap[duration as keyof typeof durationMap] || duration;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const isExpiringSoon = (dataFim: string) => {
    const today = new Date();
    const endDate = new Date(dataFim);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Carregando assinaturas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Minhas Assinaturas</h2>
          <p className="text-muted-foreground">Gerencie seus planos e assinaturas</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Assinatura
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura ativa</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira assinatura para acessar recursos premium
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Assinatura
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className={isExpiringSoon(subscription.data_fim) ? "border-yellow-200 bg-yellow-50/50" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{subscription.plano}</CardTitle>
                    <CardDescription>
                      {getDurationLabel(subscription.duracao)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(subscription.valor)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{subscription.duracao === "mensal" ? "mês" : "período"}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Início: {formatDate(subscription.data_inicio)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Fim: {formatDate(subscription.data_fim)}
                  </div>
                </div>

                {isExpiringSoon(subscription.data_fim) && (
                  <div className="p-2 bg-yellow-100 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Expira em breve!
                    </p>
                  </div>
                )}

                {subscription.renovacao_automatica && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Auto-renovação ativa
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateSubscriptionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchSubscriptions}
        userId={userId}
      />
    </div>
  );
};

export default SubscriptionsTab;