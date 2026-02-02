import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const SubscriptionPlansTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-cinzel text-secondary mb-2">Subscription Plans</h2>
        <p className="text-muted-foreground">Choose a plan that works for you</p>
      </div>

      <Card className="kitara-card">
        <CardContent className="py-16 text-center">
          <Construction className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-cinzel text-secondary mb-3">Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            Subscription plans are under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPlansTab;
