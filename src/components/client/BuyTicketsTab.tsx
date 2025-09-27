import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Ticket, CreditCard, QrCode, CheckCircle, Clock, PartyPopper, Star, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PaymentStep = 'select' | 'payment' | 'confirm';
type PaymentMethodType = 'pix' | 'credit' | null;

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

const BuyTicketsTab = () => {
  const [quantity, setQuantity] = useState(1);
  const [currentStep, setCurrentStep] = useState<PaymentStep>('select');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(null);
  const [installments, setInstallments] = useState(1);
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [adminCode, setAdminCode] = useState("");
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const TICKET_PRICE = 50.00;
  const totalValue = quantity * TICKET_PRICE;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyTickets = () => {
    if (quantity < 1 || quantity > 100) {
      toast({
        title: "Quantidade inválida",
        description: "Selecione entre 1 e 100 ingressos",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentMethodSelect = () => {
    if (!paymentMethod) {
      toast({
        title: "Selecione uma forma de pagamento",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'credit' && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)) {
      toast({
        title: "Preencha todos os dados do cartão",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('confirm');
  };

  const handleConfirmPayment = async () => {
    if (!paymentMethod) return;

    setIsProcessing(true);

    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (paymentMethod === 'pix') {
        toast({
          title: "PIX gerado com sucesso!",
          description: "Escaneie o QR Code ou copie a chave PIX para finalizar o pagamento",
        });
      } else {
        toast({
          title: "Pagamento processado com sucesso!",
          description: `${quantity} ingresso(s) comprado(s) - Total: ${formatCurrency(getFinalValue())}`,
        });
      }

      // Reset form
      resetForm();

    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente ou escolha outra forma de pagamento",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setQuantity(1);
    setCurrentStep('select');
    setPaymentMethod(null);
    setInstallments(1);
    setCardData({ number: '', name: '', expiry: '', cvv: '' });
    setShowAdminCode(false);
    setAdminCode("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getFinalValue = () => {
    if (paymentMethod === 'credit' && installments > 1) {
      const interest = totalValue * 0.06; // 6% total interest
      return totalValue + interest;
    }
    return totalValue;
  };

  const getInstallmentValue = () => {
    return getFinalValue() / installments;
  };

  // Tela de seleção de quantidade
  if (currentStep === 'select') {
    return (
      <div className="space-y-6">
        <div className="circus-stars">
          <h2 className="text-3xl font-bungee text-primary mb-2">🎪 Ingressos MOSKINO</h2>
          <p className="text-muted-foreground font-fredoka font-medium">Garante já seu lugar no Grande Espetáculo!</p>
        </div>

        <Card className="circus-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-fredoka font-bold text-xl">
              <Ticket className="h-6 w-6 text-accent animate-pulse" />
              Ingressos Disponíveis
              <PartyPopper className="h-5 w-5 text-secondary animate-bounce" />
            </CardTitle>
            <CardDescription className="font-fredoka text-base">
              🎭 Evento exclusivo com entrada garantida por blockchain 🎭
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 circus-card">
                <span className="text-lg font-fredoka font-bold">🎟️ Valor por ingresso</span>
                <Badge variant="secondary" className="text-xl px-4 py-2 font-bungee">
                  {formatCurrency(TICKET_PRICE)}
                </Badge>
              </div>

              <div className="space-y-3">
                <Label htmlFor="quantity" className="font-fredoka font-bold text-base">🎪 Quantidade de ingressos</Label>
                <div className="flex items-center gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="circus-button h-12 w-12"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="text-center w-24 h-12 text-xl font-bold font-fredoka"
                    min="1"
                    max="100"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 100}
                    className="circus-button h-12 w-12"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center font-fredoka">
                  🎯 Máximo: 100 ingressos por compra
                </p>
              </div>

              <Separator className="border-primary/30" />

              <div className="space-y-3 circus-card p-4">
                <div className="flex justify-between font-fredoka">
                  <span>Subtotal ({quantity}x)</span>
                  <span>{formatCurrency(quantity * TICKET_PRICE)}</span>
                </div>
                <div className="flex justify-between font-bungee text-2xl">
                  <span>Total</span>
                  <span className="text-accent">{formatCurrency(totalValue)}</span>
                </div>
              </div>

              <Button onClick={handleBuyTickets} className="circus-button w-full text-xl py-6 font-fredoka font-bold text-background" size="lg">
                <Ticket className="h-6 w-6 mr-3" />
                🎭 Comprar {quantity} Ingresso{quantity > 1 ? 's' : ''} 🎭
                <Star className="h-5 w-5 ml-3 animate-spin" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de seleção de forma de pagamento
  if (currentStep === 'payment') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentStep('select')}>
            ← Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Forma de Pagamento</h2>
            <p className="text-muted-foreground">Escolha como deseja pagar</p>
          </div>
        </div>

        <Card className="circus-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-fredoka font-bold">
              <Ticket className="h-6 w-6 text-accent animate-pulse" />
              🎪 Resumo do Pedido
              <PartyPopper className="h-5 w-5 text-secondary animate-bounce" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Ingressos ({quantity}x)</span>
              <span>{formatCurrency(TICKET_PRICE)} cada</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selecione a Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Button
                variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('pix')}
                className="h-16 justify-start gap-4"
              >
                <QrCode className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">PIX</div>
                  <div className="text-sm text-muted-foreground">Pagamento instantâneo</div>
                </div>
              </Button>

              <Button
                variant={paymentMethod === 'credit' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('credit')}
                className="h-16 justify-start gap-4"
              >
                <CreditCard className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Cartão de Crédito</div>
                  <div className="text-sm text-muted-foreground">À vista ou parcelado</div>
                </div>
              </Button>
            </div>

            {paymentMethod === 'credit' && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold">Dados do Cartão</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      value={cardData.number}
                      onChange={(e) => setCardData({...cardData, number: e.target.value})}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      value={cardData.name}
                      onChange={(e) => setCardData({...cardData, name: e.target.value})}
                      placeholder="Nome como está no cartão"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardExpiry">Validade</Label>
                    <Input
                      id="cardExpiry"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                      placeholder="000"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installments">Parcelamento</Label>
                  <Select value={installments.toString()} onValueChange={(value) => setInstallments(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o parcelamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">À vista - {formatCurrency(totalValue)}</SelectItem>
                      <SelectItem value="2">2x - {formatCurrency(getFinalValue() / 2)}/mês (com juros)</SelectItem>
                      <SelectItem value="3">3x - {formatCurrency(getFinalValue() / 3)}/mês (com juros)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="adminCode"
                checked={showAdminCode}
                onChange={(e) => setShowAdminCode(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="adminCode" className="text-sm">
                Tenho código de aprovação administrativa
              </Label>
            </div>

            {showAdminCode && (
              <div className="space-y-2">
                <Label htmlFor="code">Código de Aprovação</Label>
                <Input
                  id="code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Digite o código especial"
                />
              </div>
            )}

            <Button onClick={handlePaymentMethodSelect} className="w-full" size="lg">
              Continuar para Confirmação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de confirmação final
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setCurrentStep('payment')}>
          ← Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Confirmar Pagamento</h2>
          <p className="text-muted-foreground">Revise os dados antes de finalizar</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Confirmação do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Ingressos</span>
            <span>{quantity}x {formatCurrency(TICKET_PRICE)}</span>
          </div>
          <div className="flex justify-between">
            <span>Forma de Pagamento</span>
            <span className="flex items-center gap-2">
              {paymentMethod === 'pix' ? <QrCode className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
              {paymentMethod === 'pix' ? 'PIX' : `Cartão de Crédito ${installments > 1 ? `${installments}x` : 'à vista'}`}
            </span>
          </div>
          {paymentMethod === 'credit' && cardData.number && (
            <div className="flex justify-between">
              <span>Cartão</span>
              <span>**** **** **** {cardData.number.slice(-4)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(getFinalValue())}</span>
          </div>
          {paymentMethod === 'credit' && installments > 1 && (
            <div className="text-sm text-muted-foreground">
              {installments}x de {formatCurrency(getInstallmentValue())}
            </div>
          )}
        </CardContent>
      </Card>

      {paymentMethod === 'pix' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Instruções PIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Após confirmar, você receberá o QR Code do PIX para realizar o pagamento. 
              O pagamento deve ser feito em até 30 minutos.
            </p>
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={handleConfirmPayment} 
        className="w-full" 
        size="lg"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Clock className="h-5 w-5 mr-2 animate-spin" />
            Processando Pagamento...
          </>
        ) : (
          <>
            Confirmar Pagamento - {formatCurrency(getFinalValue())}
          </>
        )}
      </Button>
    </div>
  );
};

export default BuyTicketsTab;