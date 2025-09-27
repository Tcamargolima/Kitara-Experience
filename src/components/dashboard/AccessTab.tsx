import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Clock, CheckCircle, XCircle } from "lucide-react";

interface Access {
  id: string;
  ticket_id: string;
  data_acesso: string;
  status: string;
  tickets_blankapp: {
    evento: string;
    local_evento: string;
  };
}

interface AccessTabProps {
  userId: string;
}

const AccessTab = ({ userId }: AccessTabProps) => {
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccesses = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("acessos_blankapp")
        .select(`
          *,
          tickets_blankapp (
            evento,
            local_evento
          )
        `)
        .eq("usuario_id", userId)
        .order("data_acesso", { ascending: false });

      if (error) throw error;
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
      usado: { 
        variant: "default" as const, 
        label: "Usado", 
        icon: CheckCircle 
      },
      pendente: { 
        variant: "secondary" as const, 
        label: "Pendente", 
        icon: Clock 
      },
      cancelado: { 
        variant: "destructive" as const, 
        label: "Cancelado", 
        icon: XCircle 
      },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    const IconComponent = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
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
        <h2 className="text-2xl font-bold">Meus Acessos</h2>
        <p className="text-muted-foreground">Histórico de acessos aos eventos</p>
      </div>

      {accesses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum acesso registrado</h3>
            <p className="text-muted-foreground">
              Seus acessos aos eventos aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {accesses.map((access) => (
            <Card key={access.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {access.tickets_blankapp.evento}
                    </CardTitle>
                    <CardDescription>
                      {access.tickets_blankapp.local_evento}
                    </CardDescription>
                  </div>
                  {getStatusBadge(access.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Data do acesso: {formatDateTime(access.data_acesso)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessTab;