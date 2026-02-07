import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
import type { Ticket, ElixirValidation } from "@/lib/api";

interface Props {
  ticket: Ticket;
  elixirValidation: ElixirValidation | null;
  purchasing: boolean;
  onBuy: (ticket: Ticket) => void;
}

const TicketCard = ({ ticket, elixirValidation, purchasing, onBuy }: Props) => {
  const originalPrice = ticket.price;

  let finalPrice = originalPrice;

  if (elixirValidation?.valid) {
    const pct = elixirValidation.discount_percent || 0;
    const fix = elixirValidation.discount_fixed || 0;
    finalPrice = Math.max(originalPrice - (originalPrice * pct) / 100 - fix, 0);
  }

  return (
    <Card className="kitara-card">
      <CardHeader>
        <CardTitle className="text-secondary">{ticket.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-2xl font-bold text-primary">
          R$ {finalPrice.toFixed(2)}
        </div>

        <Button
          disabled={purchasing || ticket.stock <= 0}
          onClick={() => onBuy(ticket)}
          className="kitara-button w-full"
        >
          {purchasing ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Processando
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2" size={16} />
              Comprar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TicketCard;