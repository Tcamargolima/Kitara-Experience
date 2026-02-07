import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Gift } from "lucide-react";

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (form: { code: string; discountPercent: string; maxUses: string }) => Promise<void>;
  submitting: boolean;
  form: { code: string; discountPercent: string; maxUses: string };
  setForm: (form: { code: string; discountPercent: string; maxUses: string }) => void;
}

const CreateCouponDialog = ({ open, onOpenChange, onCreate, submitting, form, setForm }: CreateCouponDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="kitara-card">
      <DialogHeader>
        <DialogTitle className="font-cinzel text-secondary">Novo Cupom Elixir</DialogTitle>
        <DialogDescription>Crie um código de desconto</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Código</Label>
          <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="kitara-input" placeholder="ELIXIR2024" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Desconto (%)</Label>
            <Input type="number" min="0" max="100" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} className="kitara-input" />
          </div>
          <div>
            <Label>Usos Máximos</Label>
            <Input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} className="kitara-input" />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onCreate(form)} disabled={submitting} className="kitara-button">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Criar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default CreateCouponDialog;
