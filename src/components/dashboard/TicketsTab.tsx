import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, MapPin, Users, Tent, PartyPopper, Star } from "lucide-react";
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
        <div className="circus-stars">
          <h2 className="text-3xl font-bungee text-primary">🎪 Meus Espetáculos</h2>
          <p className="text-muted-foreground font-fredoka font-medium">Gerencie seus eventos circenses e ingressos</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="circus-button font-fredoka font-bold text-background">
          <Plus className="h-5 w-5 mr-2" />
          ✨ Novo Espetáculo
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card className="circus-card">
          <CardContent className="py-16 text-center">
            <Tent className="h-16 w-16 mx-auto mb-6 text-muted-foreground animate-pulse" />
            <h3 className="text-xl font-bungee text-primary mb-3">🎭 Nenhum espetáculo criado</h3>
            <p className="text-muted-foreground font-fredoka font-medium mb-6">
              Comece criando seu primeiro evento circense mágico!
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="circus-button font-fredoka font-bold text-background">
              <Plus className="h-5 w-5 mr-2" />
              🌟 Criar Primeiro Espetáculo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="circus-card hover:-translate-y-2 transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-fredoka font-bold text-primary flex items-center gap-2">
                    <PartyPopper className="h-5 w-5 text-accent animate-bounce" />
                    {ticket.nome_evento}
                  </CardTitle>
                  {getStatusBadge(ticket.quantidade_disponivel)}
                </div>
                <CardDescription className="flex items-center gap-2 font-fredoka font-medium">
                  <Calendar className="h-4 w-4 text-secondary" />
                  📅 {formatDate(ticket.data_evento)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-fredoka">
                  <MapPin className="h-4 w-4 text-accent" />
                  📍 {ticket.local_evento}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-fredoka">
                  <Users className="h-4 w-4 text-primary" />
                  👥 {ticket.quantidade_disponivel} vagas disponíveis
                </div>
                
                <div className="pt-3 border-t border-primary/30 circus-card p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-fredoka font-medium">💰 Preço:</span>
                    <span className="text-xl font-bungee text-accent">
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