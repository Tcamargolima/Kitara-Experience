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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

const CreateTicketDialog = ({ open, onOpenChange, onSuccess, userId }: CreateTicketDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_evento: "",
    descricao: "",
    data_evento: "",
    local_evento: "",
    preco: "",
    quantidade_disponivel: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("tickets")
        .insert({
          nome_evento: formData.nome_evento,
          descricao: formData.descricao,
          data_evento: formData.data_evento + "T00:00:00Z",
          local_evento: formData.local_evento,
          preco: parseFloat(formData.preco),
          quantidade_disponivel: parseInt(formData.quantidade_disponivel),
          user_id: userId,
        });

      if (error) throw error;

      toast({
        title: "Ingresso criado com sucesso!",
        description: "Seu evento está agora disponível para venda.",
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        nome_evento: "",
        descricao: "",
        data_evento: "",
        local_evento: "",
        preco: "",
        quantidade_disponivel: "",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar ingresso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Ingresso</DialogTitle>
          <DialogDescription>
            Preencha as informações do seu evento para criar um novo ingresso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_evento">Nome do Evento</Label>
            <Input
              id="nome_evento"
              value={formData.nome_evento}
              onChange={(e) => handleInputChange("nome_evento", e.target.value)}
              placeholder="Ex: Show de Rock ao Vivo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descreva seu evento..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_evento">Data do Evento</Label>
              <Input
                id="data_evento"
                type="date"
                value={formData.data_evento}
                onChange={(e) => handleInputChange("data_evento", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => handleInputChange("preco", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local_evento">Local do Evento</Label>
            <Input
              id="local_evento"
              value={formData.local_evento}
              onChange={(e) => handleInputChange("local_evento", e.target.value)}
              placeholder="Ex: Teatro Municipal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade_disponivel">Quantidade Disponível</Label>
            <Input
              id="quantidade_disponivel"
              type="number"
              min="1"
              value={formData.quantidade_disponivel}
              onChange={(e) => handleInputChange("quantidade_disponivel", e.target.value)}
              placeholder="100"
              required
            />
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
              {loading ? "Criando..." : "Criar Ingresso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;