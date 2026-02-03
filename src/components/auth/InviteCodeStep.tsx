import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Ticket, Loader2 } from "lucide-react";
import { validateInvite } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface InviteCodeStepProps {
  onValidInvite: (code: string) => void;
  onLoginClick: () => void;
}

export const InviteCodeStep = ({ onValidInvite, onLoginClick }: InviteCodeStepProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, insira seu código de convite.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await validateInvite(code.trim());

      if (result.valid) {
        toast({
          title: "Código válido!",
          description: "Você pode prosseguir com o cadastro.",
        });
        onValidInvite(code.trim().toUpperCase());
      } else {
        toast({
          title: "Código inválido",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível validar o código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="kitara-card w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Ticket className="h-12 w-12 text-secondary" />
        </div>
        <CardTitle className="font-cinzel text-secondary text-2xl">
          Acesso Exclusivo
        </CardTitle>
        <CardDescription>
          KITARA é apenas por convite. Insira seu código para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Código de Convite</Label>
            <Input
              id="invite-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              className="kitara-input text-center text-lg tracking-widest"
              maxLength={12}
              disabled={loading}
            />
          </div>
          
          <Button
            type="submit"
            className="kitara-button w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              "Validar Código"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-secondary hover:underline font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
