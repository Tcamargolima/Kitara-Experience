import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, CalendarDays } from "lucide-react";
import type { Ticket, ElixirValidation } from "@/lib/api";

interface TicketCardProps {
  ticket: Ticket;
  elixirValidation: ElixirValidation | null;
  purchasing: boolean;
  onBuy: (ticket: Ticket) => void;
}

const TicketCard = ({ ticket, elixirValidation, purchasing, onBuy }: TicketCardProps) => {
  const originalPrice = ticket.price;
  let finalPrice = originalPrice;

  if (elixirValidation?.valid) {
    const pct = elixirValidation.discount_percent || 0;
    const fix = elixirValidation.discount_fixed || 0;
    finalPrice = Math.max(originalPrice - (originalPrice * pct) / 100 - fix, 0);
  }

  const hasDiscount = elixirValidation?.valid && finalPrice < originalPrice;
  const soldOut = (ticket.stock ?? 0) <= 0;

  return (
    <Card className="kitara-card group hover:border-secondary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-secondary text-lg font-cinzel">
            {ticket.name}
          </CardTitle>
          <Badge
            variant={soldOut ? "destructive" : "default"}
            className={soldOut ? "" : "bg-primary/15 text-primary border-primary/20"}
          >
            {soldOut ? "Esgotado" : `${ticket.stock} disp.`}
          </Badge>
        </div>
        {ticket.description && (
          <CardDescription className="text-sm leading-relaxed">
            {ticket.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {ticket.event_date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(ticket.event_date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        )}

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
          onClick={() => onBuy(ticket)}
          disabled={soldOut || purchasing}
          className="kitara-button w-full"
        >
          {purchasing ? (
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
};

export default TicketCard;
