import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Key } from "lucide-react";
import { useState } from "react";

interface CreateInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (form: { maxUses: string }) => Promise<string | null>;
  submitting: boolean;
  form: { maxUses: string };
  setForm: (form: { maxUses: string }) => void;
  generatedInvite: string | null;
  setGeneratedInvite: (code: string | null) => void;
}

const CreateInviteDialog = ({ open, onOpenChange, onCreate, submitting, form, setForm, generatedInvite, setGeneratedInvite }: CreateInviteDialogProps) => (
  <Dialog open={open} onOpenChange={o => { onOpenChange(o); if (!o) setGeneratedInvite(null); }}>
    <DialogContent className="kitara-card">
      <DialogHeader>
        <DialogTitle className="font-cinzel text-secondary">Gerar Código de Convite</DialogTitle>
        <DialogDescription>Crie um código para novos usuários</DialogDescription>
      </DialogHeader>
      {generatedInvite ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">Código gerado:</p>
          <p className="text-2xl font-mono text-primary tracking-widest">{generatedInvite}</p>
          <p className="text-xs text-muted-foreground mt-2">Compartilhe este código com o convidado</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label>Usos Máximos</Label>
            <Input type="number" min="1" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} className="kitara-input" />
          </div>
        </div>
      )}
      <DialogFooter>
        {!generatedInvite && (
          <Button onClick={async () => await onCreate(form)} disabled={submitting} className="kitara-button">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Gerar
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default CreateInviteDialog;
