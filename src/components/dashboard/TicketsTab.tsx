import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, MapPin, Users, Ticket } from "lucide-react";
import CreateTicketDialog from "./CreateTicketDialog";

interface TicketData {
  id: string;
  nome_evento: string;
  descricao?: string;
  data_evento: string;
  local_evento: string;
  preco: number;
  quantidade_disponivel: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TicketsTabProps {
  userId: string;
}

const TicketsTab = ({ userId }: TicketsTabProps) => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ingressos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [userId]);

  const getStatusBadge = (quantidadeDisponivel: number) => {
    if (quantidadeDisponivel > 10) {
      return <Badge variant="default">Disponível</Badge>;
    } else if (quantidadeDisponivel > 0) {
      return <Badge variant="secondary">Últimas vagas</Badge>;
    } else {
      return <Badge variant="destructive">Esgotado</Badge>;
    }
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Carregando ingressos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Meus Ingressos</h2>
          <p className="text-muted-foreground">Gerencie seus eventos e ingressos</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ingresso
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum ingresso criado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro evento e ingresso
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Ingresso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{ticket.nome_evento}</CardTitle>
                  {getStatusBadge(ticket.quantidade_disponivel)}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(ticket.data_evento)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {ticket.local_evento}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {ticket.quantidade_disponivel} vagas disponíveis
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Preço:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(ticket.preco)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTicketDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchTickets}
        userId={userId}
      />
    </div>
  );
};

export default TicketsTab;