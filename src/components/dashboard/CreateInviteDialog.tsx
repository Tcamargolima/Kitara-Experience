import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Key, Loader2, Copy, Check } from "lucide-react";
import { adminCreateInvite } from "@/lib/api";

interface CreateInviteDialogProps {
  onCreated: () => void;
}

const CreateInviteDialog = ({ onCreated }: CreateInviteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [maxUses, setMaxUses] = useState("1");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const result = await adminCreateInvite(parseInt(maxUses) || 1);
      if (result.success && result.code) {
        setGeneratedCode(result.code);
        toast({ title: "Sucesso", description: `Convite gerado: ${result.code}` });
        onCreated();
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setGeneratedCode(null);
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
          <Key className="mr-2 h-4 w-4" />
          Gerar Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="kitara-card">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-secondary">Gerar Código de Convite</DialogTitle>
          <DialogDescription>Crie um código para novos usuários</DialogDescription>
        </DialogHeader>
        {generatedCode ? (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <p className="text-sm text-muted-foreground">Código gerado:</p>
            <p className="text-3xl font-mono text-primary tracking-widest">{generatedCode}</p>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
            <p className="text-xs text-muted-foreground">Compartilhe este código com o convidado</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Usos Máximos</Label>
              <Input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className="kitara-input" />
            </div>
          </div>
        )}
        <DialogFooter>
          {!generatedCode && (
            <Button onClick={handleCreate} disabled={submitting} className="kitara-button">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInviteDialog;
