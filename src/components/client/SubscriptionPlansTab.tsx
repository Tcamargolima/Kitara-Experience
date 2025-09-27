import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tent, Check, Calendar, CreditCard, Star, PartyPopper, Sparkles } from "lucide-react";

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

  const TICKET_PRICE = 50.00;

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
      <div className="circus-stars">
        <h2 className="text-3xl font-bungee text-primary flex items-center gap-3">
          <Tent className="h-8 w-8 text-primary animate-pulse" />
          🎪 Planos Circenses
          <Star className="h-6 w-6 text-secondary animate-spin" />
        </h2>
        <p className="text-muted-foreground font-fredoka font-medium text-lg">
          ✨ Economize com nossos planos recorrentes de ingressos ✨
        </p>
      </div>

      <div className="grid gap-6">
        {[3, 6, 12].map((months) => (
          <div key={months} className="space-y-4">
            <h3 className="text-xl font-fredoka font-bold flex items-center gap-3">
              <Calendar className="h-6 w-6 text-accent" />
              🎭 Planos de {months} meses
              <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {getPlansByDuration(months).map((plan) => {
                const isPopular = mostPopular && plan.tickets === mostPopular.tickets && plan.months === mostPopular.months;
                const isBestValue = bestValue && plan.tickets === bestValue.tickets && plan.months === bestValue.months;
                
                return (
                  <Card 
                    key={`${plan.tickets}-${plan.months}`}
                    className={`circus-card relative hover:-translate-y-2 transition-all duration-300 ${
                      isPopular ? 'border-primary border-4 shadow-2xl' : 
                      isBestValue ? 'border-secondary border-4 shadow-2xl' : ''
                    }`}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary font-fredoka font-bold text-lg px-4 py-1">
                        🌟 Mais Popular
                      </Badge>
                    )}
                    {isBestValue && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary text-foreground font-fredoka font-bold text-lg px-4 py-1">
                        💎 Melhor Valor
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl font-fredoka font-bold text-primary">🎪 {plan.tickets} Ingressos</CardTitle>
                      <CardDescription className="font-fredoka font-medium">Por {months} meses de espetáculo</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bungee text-accent">
                          {formatCurrency(plan.monthlyPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground font-fredoka">por mês</div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" />
                          <span className="font-fredoka">{plan.tickets} ingressos/mês</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" />
                          <span className="font-fredoka">Renovação automática</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" />
                          <span className="font-fredoka">Segurança blockchain</span>
                        </div>
                        {plan.savings > 0 && (
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-secondary" />
                            <span className="text-secondary font-fredoka font-bold">
                              💰 Economia: {formatCurrency(plan.savings)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2 border-t border-primary/30">
                        <div className="text-xs text-muted-foreground text-center font-fredoka">
                          Total: {formatCurrency(plan.totalPrice)}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleSubscribe(plan)}
                        className={`w-full font-fredoka font-bold ${isPopular || isBestValue ? 'circus-button text-background' : ''}`}
                        variant={isPopular || isBestValue ? "default" : "outline"}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        🎭 Assinar Plano 🎭
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
        <Card className="circus-card border-primary border-4">
          <CardHeader>
            <CardTitle className="text-primary font-bungee text-xl">🎭 Plano Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between font-fredoka">
                <span>Plano:</span>
                <span className="font-bold">
                  🎪 {selectedPlan.tickets} ingressos por {selectedPlan.months} meses
                </span>
              </div>
              <div className="flex justify-between font-fredoka">
                <span>Valor mensal:</span>
                <span className="font-bold">{formatCurrency(selectedPlan.monthlyPrice)}</span>
              </div>
              <div className="flex justify-between font-fredoka">
                <span>Total:</span>
                <span className="font-bungee text-lg text-accent">{formatCurrency(selectedPlan.totalPrice)}</span>
              </div>
              {selectedPlan.savings > 0 && (
                <div className="flex justify-between font-fredoka">
                  <span>💰 Economia:</span>
                  <span className="font-bold text-secondary">{formatCurrency(selectedPlan.savings)}</span>
                </div>
              )}
            </div>
            
            <Button className="circus-button w-full mt-6 text-xl py-4 font-fredoka font-bold text-background" size="lg">
              🎭 Prosseguir para Pagamento 🎭
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionPlansTab;