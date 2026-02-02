import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Construction } from "lucide-react";

interface TicketsTabProps {
  userId: string;
}

const TicketsTab = ({ userId }: TicketsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-cinzel text-secondary">Tickets</h2>
          <p className="text-muted-foreground">Manage your event tickets</p>
        </div>
      </div>

      <Card className="kitara-card">
        <CardContent className="py-16 text-center">
          <Construction className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-cinzel text-secondary mb-3">Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            Ticket management functionality is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsTab;
