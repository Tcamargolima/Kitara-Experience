import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Ticket, Sparkles } from "lucide-react";
import {
  getActiveTickets, createOrder,
  type Ticket as TicketType, type ElixirValidation,
} from "@/lib/api";
import ElixirCodeInput from "@/components/checkout/ElixirCodeInput";
import TicketCard from "@/components/dashboard/TicketCard";
import SkeletonCard from "@/components/common/SkeletonCard";

const ProductsTab = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [elixirValidation, setElixirValidation] = useState<ElixirValidation | null>(null);
  const [elixirCode, setElixirCode] = useState("");
  const [confirmTicket, setConfirmTicket] = useState<TicketType | null>(null);
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

  const calcFinalPrice = (ticket: TicketType) => {
    let price = ticket.price;
    if (elixirValidation?.valid) {
      const pct = elixirValidation.discount_percent || 0;
      const fix = elixirValidation.discount_fixed || 0;
      price = Math.max(price - (price * pct) / 100 - fix, 0);
    }
    return price;
  };

  const handleConfirmBuy = async () => {
    if (!confirmTicket) return;
    setPurchasingId(confirmTicket.id);
    setConfirmTicket(null);
    try {
      const result = await createOrder(confirmTicket.id, 1, elixirValidation?.valid ? elixirCode : undefined);
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-cinzel text-secondary font-semibold tracking-tight">Ingressos</h2>
        <p className="text-sm text-muted-foreground mt-1">Escolha seu ingresso e aplique códigos de desconto</p>
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
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="kitara-card animate-fade-in">
          <CardContent className="py-16 text-center space-y-4">
            <div className="relative inline-block">
              <Ticket className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <Sparkles className="h-6 w-6 text-secondary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg">Nenhum ingresso disponível no momento</p>
            <p className="text-sm text-muted-foreground/60">Novos eventos serão anunciados em breve</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {tickets.map((ticket, index) => (
            <div
              key={ticket.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <TicketCard
                ticket={ticket}
                elixirValidation={elixirValidation}
                purchasing={purchasingId === ticket.id}
                onBuy={(t) => setConfirmTicket(t)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Purchase Confirmation Dialog */}
      <Dialog open={!!confirmTicket} onOpenChange={(open) => !open && setConfirmTicket(null)}>
        <DialogContent className="kitara-card animate-slide-up">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-secondary">Confirmar Compra</DialogTitle>
            <DialogDescription>Revise os detalhes antes de prosseguir</DialogDescription>
          </DialogHeader>
          {confirmTicket && (
            <div className="space-y-4 py-2 animate-fade-in">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ingresso</span>
                <span className="font-medium">{confirmTicket.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço original</span>
                <span>R$ {confirmTicket.price.toFixed(2)}</span>
              </div>
              {elixirValidation?.valid && (
                <div className="flex justify-between text-primary">
                  <span>Desconto Elixir</span>
                  <span>-{elixirValidation.discount_percent}%</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">R$ {calcFinalPrice(confirmTicket).toFixed(2)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmTicket(null)}>Cancelar</Button>
            <Button className="kitara-button" onClick={handleConfirmBuy}>Confirmar Compra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsTab;
