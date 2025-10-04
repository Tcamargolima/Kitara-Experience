import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share, X, Plus } from "lucide-react";

export const IOSInstallInstructions = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    if (isIOS && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('ios-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('ios-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-2 border-primary shadow-lg">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            🎪 Instalar MOSKINO no iPhone
          </CardTitle>
          <CardDescription>
            Para uma melhor experiência, adicione o app à sua tela inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-1">
                <Share className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">1. Toque no botão de compartilhar</p>
                <p className="text-muted-foreground">No menu inferior do Safari</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-1">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">2. Selecione "Adicionar à Tela de Início"</p>
                <p className="text-muted-foreground">Role para baixo nas opções</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-1">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">3. Confirme</p>
                <p className="text-muted-foreground">Toque em "Adicionar" no topo</p>
              </div>
            </div>
          </div>
          <Button onClick={handleDismiss} variant="outline" className="w-full">
            Entendi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
