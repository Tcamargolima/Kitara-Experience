import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Mail, LogOut } from "lucide-react";

export const PendingApprovalScreen = () => {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen kitara-bg flex items-center justify-center p-4">
      <Card className="max-w-lg w-full kitara-card">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-cinzel text-secondary">
            Pending Approval
          </CardTitle>
          <CardDescription className="text-base">
            Your account is being reviewed
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  Registration Received
                </p>
                <p className="text-sm text-muted-foreground">
                  We have received your registration. Our team is reviewing your information.
                </p>
              </div>
            </div>
            
            {profile?.email && (
              <div className="pt-2 border-t border-secondary/20">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Email:</span> {profile.email}
                </p>
              </div>
            )}
          </div>

          <div className="bg-primary/5 rounded-lg p-4 space-y-2 border border-secondary/20">
            <p className="font-semibold text-sm text-secondary font-cinzel">
              What happens next?
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>An administrator will review your registration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>You will be notified when approved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>After approval, you'll have full access</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <p className="text-sm text-center text-muted-foreground mb-4">
              This process usually takes up to 24 hours
            </p>
            <Button 
              variant="outline" 
              className="w-full kitara-button-outline"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
