import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminCreateInvite } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CreateUserDialogProps {
  onUserCreated?: () => void;
}

/**
 * CreateUserDialog - Now creates INVITE codes instead of direct users
 * Following KITARA security model: users must register with invite code
 * Admin creates invites, users self-register with MFA
 */
const CreateUserDialog = ({ onUserCreated }: CreateUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setMaxUses(1);
    setExpiresInDays(7);
    setGeneratedCode(null);
  };

  const handleCreateInvite = async () => {
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      
      const result = await adminCreateInvite(maxUses, expiresAt.toISOString());
      
      if (result.success && result.code) {
        setGeneratedCode(result.code);
        toast({ 
          title: "Convite criado!", 
          description: `Código: ${result.code}` 
        });
        if (onUserCreated) onUserCreated();
      } else {
        throw new Error(result.message || "Falha ao criar convite");
      }
    } catch (err: any) {
      const message = err?.message || "Falha ao criar convite";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({ title: "Copiado!", description: "Código copiado para área de transferência" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="kitara-button">Novo Convite</Button>
      </DialogTrigger>
      <DialogContent className="kitara-card">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-secondary">Criar Código de Convite</DialogTitle>
          <DialogDescription>
            Gere um código de convite para novos usuários se registrarem
          </DialogDescription>
        </DialogHeader>
        
        {generatedCode ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Código gerado:</p>
              <p className="text-2xl font-mono font-bold text-primary tracking-wider">
                {generatedCode}
              </p>
            </div>
            <Button onClick={copyToClipboard} className="w-full kitara-button">
              Copiar Código
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label>Número máximo de usos</Label>
                <Input
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="kitara-input"
                />
              </div>
              <div>
                <Label>Expira em (dias)</Label>
                <Input
                  type="number"
                  min={1}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="kitara-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateInvite} 
                className="kitara-button"
                disabled={loading}
              >
                {loading ? "Gerando..." : "Gerar Convite"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;