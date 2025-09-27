import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, Calendar, CreditCard } from "lucide-react";

interface Plan {
  tickets: number;
  months: number;
  monthlyPrice: number;
  totalPrice: number;
  savings: number;
}

const SubscriptionPlansTab = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const TICKET_PRICE = 90.00;

  const plans: Plan[] = [
    { tickets: 10, months: 3, monthlyPrice: 300, totalPrice: 900, savings: 0 },
    { tickets: 10, months: 6, monthlyPrice: 285, totalPrice: 1710, savings: 90 },
    { tickets: 10, months: 12, monthlyPrice: 270, totalPrice: 3240, savings: 240 },
    { tickets: 20, months: 3, monthlyPrice: 570, totalPrice: 1710, savings: 90 },
    { tickets: 20, months: 6, monthlyPrice: 540, totalPrice: 3240, savings: 240 },
    { tickets: 20, months: 12, monthlyPrice: 510, totalPrice: 6120, savings: 480 },
    { tickets: 30, months: 3, monthlyPrice: 810, totalPrice: 2430, savings: 270 },
    { tickets: 30, months: 6, monthlyPrice: 765, totalPrice: 4590, savings: 540 },
    { tickets: 30, months: 12, monthlyPrice: 720, totalPrice: 8640, savings: 960 },
    { tickets: 40, months: 3, monthlyPrice: 1080, totalPrice: 3240, savings: 360 },
    { tickets: 40, months: 6, monthlyPrice: 1020, totalPrice: 6120, savings: 720 },
    { tickets: 40, months: 12, monthlyPrice: 960, totalPrice: 11520, savings: 1440 },
    { tickets: 50, months: 3, monthlyPrice: 1350, totalPrice: 4050, savings: 450 },
    { tickets: 50, months: 6, monthlyPrice: 1275, totalPrice: 7650, savings: 900 },
    { tickets: 50, months: 12, monthlyPrice: 1200, totalPrice: 14400, savings: 1800 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    toast({
      title: "Plano selecionado!",
      description: `${plan.tickets} ingressos por ${plan.months} meses - ${formatCurrency(plan.totalPrice)}`,
    });
  };

  const getPlansByDuration = (months: number) => {
    return plans.filter(plan => plan.months === months);
  };

  const getMostPopularPlan = () => {
    return plans.find(plan => plan.tickets === 20 && plan.months === 6);
  };

  const getBestValuePlan = () => {
    return plans.reduce((best, current) => {
      const currentSavingsPercentage = (current.savings / (current.tickets * TICKET_PRICE * current.months)) * 100;
      const bestSavingsPercentage = (best.savings / (best.tickets * TICKET_PRICE * best.months)) * 100;
      return currentSavingsPercentage > bestSavingsPercentage ? current : best;
    });
  };

  const mostPopular = getMostPopularPlan();
  const bestValue = getBestValuePlan();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          Planos de Assinatura
        </h2>
        <p className="text-muted-foreground">
          Economize com nossos planos recorrentes de ingressos
        </p>
      </div>

      <div className="grid gap-6">
        {[3, 6, 12].map((months) => (
          <div key={months} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Planos de {months} meses
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {getPlansByDuration(months).map((plan) => {
                const isPopular = mostPopular && plan.tickets === mostPopular.tickets && plan.months === mostPopular.months;
                const isBestValue = bestValue && plan.tickets === bestValue.tickets && plan.months === bestValue.months;
                
                return (
                  <Card 
                    key={`${plan.tickets}-${plan.months}`}
                    className={`relative ${
                      isPopular ? 'border-primary shadow-lg' : 
                      isBestValue ? 'border-secondary shadow-lg' : ''
                    }`}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                        Mais Popular
                      </Badge>
                    )}
                    {isBestValue && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-secondary">
                        Melhor Valor
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{plan.tickets} Ingressos</CardTitle>
                      <CardDescription>Por {months} meses</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(plan.monthlyPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">por mês</div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{plan.tickets} ingressos/mês</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Renovação automática</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Segurança blockchain</span>
                        </div>
                        {plan.savings > 0 && (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-secondary" />
                            <span className="text-secondary font-medium">
                              Economia: {formatCurrency(plan.savings)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground text-center">
                          Total: {formatCurrency(plan.totalPrice)}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleSubscribe(plan)}
                        className="w-full"
                        variant={isPopular || isBestValue ? "default" : "outline"}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Assinar
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Plano Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plano:</span>
                <span className="font-semibold">
                  {selectedPlan.tickets} ingressos por {selectedPlan.months} meses
                </span>
              </div>
              <div className="flex justify-between">
                <span>Valor mensal:</span>
                <span className="font-semibold">{formatCurrency(selectedPlan.monthlyPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold text-primary">{formatCurrency(selectedPlan.totalPrice)}</span>
              </div>
              {selectedPlan.savings > 0 && (
                <div className="flex justify-between">
                  <span>Economia:</span>
                  <span className="font-bold text-secondary">{formatCurrency(selectedPlan.savings)}</span>
                </div>
              )}
            </div>
            
            <Button className="w-full mt-4" size="lg">
              Prosseguir para Pagamento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionPlansTab;