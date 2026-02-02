import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share, X, Plus } from "lucide-react";

export const IOSInstallInstructions = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
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
      <Card className="kitara-card shadow-lg">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 font-cinzel text-secondary">
            ⚡ Install KITARA on iPhone
          </CardTitle>
          <CardDescription>
            For a better experience, add the app to your home screen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-1">
                <Share className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">1. Tap the share button</p>
                <p className="text-muted-foreground">In Safari's bottom menu</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-1">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">2. Select "Add to Home Screen"</p>
                <p className="text-muted-foreground">Scroll down in the options</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-1">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">3. Confirm</p>
                <p className="text-muted-foreground">Tap "Add" at the top</p>
              </div>
            </div>
          </div>
          <Button onClick={handleDismiss} variant="outline" className="w-full kitara-button-outline">
            Got it
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
