import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Mail, LogOut } from "lucide-react";

export const PendingApprovalScreen = () => {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-2">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Aguardando Aprovação
          </CardTitle>
          <CardDescription className="text-base">
            Sua conta está em análise pelo nosso circo!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  Cadastro Recebido
                </p>
                <p className="text-sm text-muted-foreground">
                  Recebemos seu cadastro com sucesso! Nossa equipe está analisando suas informações.
                </p>
              </div>
            </div>
            
            {profile?.phone && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Telefone cadastrado:</span> {profile.phone}
                </p>
              </div>
            )}
          </div>

          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-sm text-primary">
              🎪 O que acontece agora?
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Um administrador revisará seu cadastro</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Você receberá uma notificação quando for aprovado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Após aprovação, terá acesso completo ao aplicativo</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <p className="text-sm text-center text-muted-foreground mb-4">
              Este processo geralmente leva até 24 horas
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
