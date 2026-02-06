import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Ticket } from "lucide-react";
import {
  getActiveTickets,
  createOrder,
  type Ticket as TicketType,
  type ElixirValidation,
} from "@/lib/api";
import ElixirCodeInput from "@/components/checkout/ElixirCodeInput";
import TicketCard from "@/components/dashboard/TicketCard";

/**
 * ProductsTab - Ticket purchasing with Elixir discount codes
 * Uses RPC only — no direct supabase.from()
 */
const ProductsTab = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [elixirValidation, setElixirValidation] = useState<ElixirValidation | null>(null);
  const [elixirCode, setElixirCode] = useState("");
  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      setTickets(await getActiveTickets());
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar os ingressos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleBuyTicket = async (ticket: TicketType) => {
    setPurchasingId(ticket.id);
    try {
      const result = await createOrder(ticket.id, 1, elixirValidation?.valid ? elixirCode : undefined);
      if (result.success) {
        toast({ title: "Pedido criado!", description: `Valor: R$ ${result.final_price?.toFixed(2)}. Aguardando pagamento.` });
        setElixirCode("");
        setElixirValidation(null);
        fetchTickets();
      } else {
        toast({ title: "Erro", description: result.message || "Não foi possível criar o pedido.", variant: "destructive" });
      }
    } finally {
      setPurchasingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-cinzel text-secondary">Ingressos</h2>
        <p className="text-muted-foreground">Escolha seu ingresso e aplique códigos de desconto</p>
      </div>

      {/* Elixir Code */}
      <Card className="kitara-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-cinzel text-secondary flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Código Elixir
          </CardTitle>
          <CardDescription>Tem um código de desconto? Aplique antes de comprar.</CardDescription>
        </CardHeader>
        <CardContent>
          <ElixirCodeInput
            value={elixirCode}
            onApplied={(res) => {
              setElixirValidation(res);
              if (res?.valid) {
                setElixirCode(res.code || elixirCode);
                toast({ title: "Código válido!", description: `Desconto de ${res.discount_percent}% aplicado.` });
              } else if (res) {
                toast({ title: "Código inválido", description: res.message, variant: "destructive" });
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      {tickets.length === 0 ? (
        <Card className="kitara-card">
          <CardContent className="py-16 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">Nenhum ingresso disponível no momento</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              elixirValidation={elixirValidation}
              purchasing={purchasingId === ticket.id}
              onBuy={handleBuyTicket}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
