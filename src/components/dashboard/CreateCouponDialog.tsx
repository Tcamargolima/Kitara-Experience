import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Gift, Loader2 } from "lucide-react";
import { adminCreateCoupon } from "@/lib/api";

interface CreateCouponDialogProps {
  onCreated: () => void;
}

const CreateCouponDialog = ({ onCreated }: CreateCouponDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", discountPercent: "", maxUses: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!form.code) {
      toast({ title: "Erro", description: "Código é obrigatório.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const result = await adminCreateCoupon(
        form.code,
        form.discountPercent ? parseInt(form.discountPercent) : undefined,
        undefined,
        form.maxUses ? parseInt(form.maxUses) : undefined
      );
      if (result.success) {
        toast({ title: "Sucesso", description: "Cupom criado!" });
        setOpen(false);
        setForm({ code: "", discountPercent: "", maxUses: "" });
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
        <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
          <Gift className="mr-2 h-4 w-4" />
          Criar Cupom Elixir
        </Button>
      </DialogTrigger>
      <DialogContent className="kitara-card">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-secondary">Novo Cupom Elixir</DialogTitle>
          <DialogDescription>Crie um código de desconto</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Código</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="kitara-input" placeholder="ELIXIR2024" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Desconto (%)</Label>
              <Input type="number" min="0" max="100" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} className="kitara-input" />
            </div>
            <div>
              <Label>Usos Máximos</Label>
              <Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="kitara-input" />
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

export default CreateCouponDialog;
