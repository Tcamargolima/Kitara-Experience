import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

const BuyTicketsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-cinzel text-secondary mb-2">Buy Tickets</h2>
        <p className="text-muted-foreground">Purchase event tickets</p>
      </div>

      <Card className="kitara-card">
        <CardContent className="py-16 text-center">
          <Construction className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-cinzel text-secondary mb-3">Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            Ticket purchasing functionality is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyTicketsTab;
