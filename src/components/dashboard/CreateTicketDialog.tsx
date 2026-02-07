import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Ticket, Loader2 } from "lucide-react";
import { adminCreateTicket } from "@/lib/api";

interface CreateTicketDialogProps {
  onCreated: () => void;
}

const CreateTicketDialog = ({ onCreated }: CreateTicketDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!form.name || !form.price) {
      toast({ title: "Erro", description: "Nome e preço são obrigatórios.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const result = await adminCreateTicket(form.name, form.description, parseFloat(form.price), parseInt(form.stock) || 0);
      if (result.success) {
        toast({ title: "Sucesso", description: "Ingresso criado!" });
        setOpen(false);
        setForm({ name: "", description: "", price: "", stock: "" });
        onCreated();
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="kitara-button">
          <Ticket className="mr-2 h-4 w-4" />
          Criar Ingresso
        </Button>
      </DialogTrigger>
      <DialogContent className="kitara-card">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-secondary">Novo Ingresso</DialogTitle>
          <DialogDescription>Crie um novo ingresso para venda</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="kitara-input" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="kitara-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Preço (R$)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="kitara-input" />
            </div>
            <div>
              <Label>Estoque</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="kitara-input" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={submitting} className="kitara-button">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;
