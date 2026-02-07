import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Activity } from "lucide-react";
import { SecuritySettings } from "@/components/security/SecuritySettings";
import { useSecurity } from "@/hooks/useSecurity";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import SecurityStatsGrid from "./SecurityStatsGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SecurityTabProps {
  userId: string;
}

export const SecurityTab = ({ userId }: SecurityTabProps) => {
  const { user, isAdmin } = useSecureAuth();
  const { securityState, enable2FA, disable2FA } = useSecurity(userId);
  const [activeTab, setActiveTab] = useState("settings");

  const handleToggle2FA = (enabled: boolean, secret?: string, backupCodes?: string[]) => {
    if (enabled && secret && backupCodes) {
      enable2FA(secret, backupCodes);
    } else {
      disable2FA();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats only for admin */}
      {isAdmin && <SecurityStatsGrid totalUsers={0} with2FA={0} locked={0} />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="kitara-tabs">
          <TabsTrigger value="settings" className="kitara-tab">
            <Shield className="h-4 w-4 mr-2" />
            Minhas Configurações
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="users" className="kitara-tab">
                <User className="h-4 w-4 mr-2" />
                Gerenciar Usuários
              </TabsTrigger>
              <TabsTrigger value="logs" className="kitara-tab">
                <Activity className="h-4 w-4 mr-2" />
                Logs de Segurança
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <SecuritySettings
            userEmail={user?.email || ""}
            has2FA={securityState.has2FA}
            loginAttempts={securityState.loginAttempts.length}
            lastLogin={new Date()}
            onToggle2FA={handleToggle2FA}
          />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="users" className="mt-6">
              <Card className="kitara-card">
                <CardHeader>
                  <CardTitle className="font-cinzel text-secondary">Gerenciamento de Usuários</CardTitle>
                  <CardDescription>Dados reais disponíveis em breve via RPC</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      O gerenciamento de segurança dos usuários será integrado com RPCs dedicadas. 
                      Use a aba "Usuários" no painel administrativo para visualizar os usuários ativos.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <Card className="kitara-card">
                <CardHeader>
                  <CardTitle className="font-cinzel text-secondary">Logs de Segurança</CardTitle>
                  <CardDescription>Histórico de eventos via RPC (em breve)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      Os logs de segurança serão exibidos aqui quando a RPC de consulta de logs estiver disponível. 
                      Os eventos já estão sendo registrados na tabela security_events.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};
