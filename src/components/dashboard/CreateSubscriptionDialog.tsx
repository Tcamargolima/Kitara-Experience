import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface CreateSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

const CreateSubscriptionDialog = ({ open, onOpenChange, onSuccess, userId }: CreateSubscriptionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plano: "",
    valor: "",
    duracao: "",
    renovacao_automatica: false,
  });
  const { toast } = useToast();

  const calculateEndDate = (duration: string): string => {
    const startDate = new Date();
    let endDate = new Date(startDate);

    switch (duration) {
      case "mensal":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "trimestral":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "semestral":
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case "anual":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    return endDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = calculateEndDate(formData.duracao);

      const { error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plano: formData.plano,
          valor: parseFloat(formData.valor),
          duracao: formData.duracao,
          data_inicio: startDate + "T00:00:00Z",
          data_fim: endDate + "T00:00:00Z",
          status: "ativa",
          renovacao_automatica: formData.renovacao_automatica,
        });

      if (error) throw error;

      toast({
        title: "Assinatura criada com sucesso!",
        description: "Sua nova assinatura está ativa.",
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        plano: "",
        valor: "",
        duracao: "",
        renovacao_automatica: false,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar assinatura",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Assinatura</DialogTitle>
          <DialogDescription>
            Configure os detalhes da sua nova assinatura.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plano">Nome do Plano</Label>
            <Input
              id="plano"
              value={formData.plano}
              onChange={(e) => handleInputChange("plano", e.target.value)}
              placeholder="Ex: Plano Premium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => handleInputChange("valor", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Duração</Label>
              <Select
                value={formData.duracao}
                onValueChange={(value) => handleInputChange("duracao", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="renovacao_automatica"
              checked={formData.renovacao_automatica}
              onCheckedChange={(checked) => handleInputChange("renovacao_automatica", checked)}
            />
            <Label htmlFor="renovacao_automatica">Auto-renovação</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Criando..." : "Criar Assinatura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubscriptionDialog;