import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, ShoppingCart } from "lucide-react";
import {
  getActiveTickets,
  applyElixir,
  createOrder,
  type Ticket,
  type ElixirValidation,
} from "@/lib/api";

/**
 * ProductsTab - Now shows Tickets for purchase
 * Uses RPC for elixir code validation and order creation
 * NO direct supabase.from() calls
 */
const ProductsTab = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [elixirCode, setElixirCode] = useState("");
  const [elixirValidation, setElixirValidation] = useState<ElixirValidation | null>(null);
  const [validatingElixir, setValidatingElixir] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await getActiveTickets();
      setTickets(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os ingressos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleApplyElixir = async () => {
    if (!elixirCode.trim()) return;

    setValidatingElixir(true);
    try {
      const result = await applyElixir(elixirCode);
      setElixirValidation(result);

      if (result.valid) {
        toast({
          title: "Código válido!",
          description: `Desconto de ${result.discount_percent}% aplicado.`,
        });
      } else {
        toast({
          title: "Código inválido",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setValidatingElixir(false);
    }
  };

  const handleBuyTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCreatingOrder(true);

    try {
      const result = await createOrder(
        ticket.id,
        1,
        elixirValidation?.valid ? elixirCode : undefined
      );

      if (result.success) {
        toast({
          title: "Pedido criado!",
          description: `Valor: R$ ${result.final_price?.toFixed(2)}. Aguardando pagamento.`,
        });
        // Reset state
        setElixirCode("");
        setElixirValidation(null);
        fetchTickets(); // Refresh stock
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível criar o pedido.",
          variant: "destructive",
        });
      }
    } finally {
      setCreatingOrder(false);
      setSelectedTicket(null);
    }
  };

  const calculatePrice = (ticket: Ticket) => {
    let finalPrice = ticket.price;
    if (elixirValidation?.valid) {
      const discountPercent = elixirValidation.discount_percent || 0;
      const discountFixed = elixirValidation.discount_fixed || 0;
      finalPrice = Math.max(ticket.price - (ticket.price * discountPercent / 100) - discountFixed, 0);
    }
    return finalPrice;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
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

      {/* Elixir Code Input */}
      <Card className="kitara-card">
        <CardHeader>
          <CardTitle className="text-lg font-cinzel text-secondary">Código Elixir (Desconto)</CardTitle>
          <CardDescription>Tem um código de desconto? Aplique antes de comprar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={elixirCode}
              onChange={(e) => {
                setElixirCode(e.target.value.toUpperCase());
                setElixirValidation(null);
              }}
              placeholder="ELIXIR2024"
              className="kitara-input font-mono"
              disabled={validatingElixir}
            />
            <Button
              onClick={handleApplyElixir}
              disabled={validatingElixir || !elixirCode.trim()}
              variant="outline"
              className="border-secondary text-secondary"
            >
              {validatingElixir ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Aplicar"
              )}
            </Button>
          </div>
          {elixirValidation && (
            <div className={`mt-2 flex items-center gap-2 text-sm ${elixirValidation.valid ? "text-primary" : "text-destructive"}`}>
              {elixirValidation.valid ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {elixirValidation.message}
              {elixirValidation.valid && elixirValidation.discount_percent && (
                <Badge variant="outline" className="ml-2">
                  -{elixirValidation.discount_percent}%
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      {tickets.length === 0 ? (
        <Card className="kitara-card">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Nenhum ingresso disponível no momento</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => {
            const originalPrice = ticket.price;
            const finalPrice = calculatePrice(ticket);
            const hasDiscount = elixirValidation?.valid && finalPrice < originalPrice;

            return (
              <Card key={ticket.id} className="kitara-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-secondary">{ticket.name}</CardTitle>
                    <Badge variant={ticket.stock > 0 ? "default" : "destructive"}>
                      {ticket.stock > 0 ? `${ticket.stock} disponíveis` : "Esgotado"}
                    </Badge>
                  </div>
                  {ticket.description && (
                    <CardDescription>{ticket.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          R$ {finalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm line-through text-muted-foreground">
                          R$ {originalPrice.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        R$ {originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => handleBuyTicket(ticket)}
                    disabled={ticket.stock <= 0 || creatingOrder}
                    className="kitara-button w-full"
                  >
                    {creatingOrder && selectedTicket?.id === ticket.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Comprar
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
