import { useState } from "react";
import {
  Shield,
  User,
  Activity,
  CheckCircle,
  AlertTriangle,
  Unlock,
  Calendar,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { SecuritySettings } from "@/components/security/SecuritySettings";
import SecurityStatsGrid from "@/components/dashboard/SecurityStatsGrid";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useSecurity } from "@/hooks/useSecurity";
import { useToast } from "@/hooks/use-toast";

const SecurityTab = () => {
  const { profile, user } = useSecureAuth();
  const { securityState } = useSecurity();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("settings");

  const totalUsers = securityState.users?.length || 0;
  const total2FA = securityState.users?.filter((u) => u.has2FA).length || 0;
  const totalLocked = securityState.users?.filter((u) => u.status === "locked").length || 0;

  const securityLogs = securityState.logs || [];
  const users = securityState.users || [];

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Atenção</Badge>;
      case "locked":
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SecurityStatsGrid
        totalUsers={totalUsers}
        total2FA={total2FA}
        totalLocked={totalLocked}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="kitara-tabs">
          <TabsTrigger value="settings" className="kitara-tab">
            <Shield className="h-4 w-4 mr-2" />
            Minhas Configurações
          </TabsTrigger>

          {profile?.role === "admin" && (
            <>
              <TabsTrigger value="users" className="kitara-tab">
                <User className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="logs" className="kitara-tab">
                <Activity className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* SETTINGS */}
        <TabsContent value="settings" className="mt-6">
          <SecuritySettings
            userEmail={user?.email || ""}
            has2FA={securityState.has2FA}
            loginAttempts={securityState.loginAttempts.length}
            lastLogin={new Date()}
            onToggle2FA={() => {}}
          />
        </TabsContent>

        {/* USERS (ADMIN ONLY) */}
        {profile?.role === "admin" && (
          <TabsContent value="users" className="mt-6">
            <Card className="kitara-card">
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>Estado de segurança dos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>2FA</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u, i) => (
                      <TableRow key={i}>
                        <TableCell>{u.user}</TableCell>
                        <TableCell>
                          {u.has2FA ? (
                            <Badge className="bg-primary">Ativo</Badge>
                          ) : (
                            <Badge variant="outline">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getUserStatusBadge(u.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* LOGS (ADMIN ONLY) */}
        {profile?.role === "admin" && (
          <TabsContent value="logs" className="mt-6">
            <Card className="kitara-card">
              <CardHeader>
                <CardTitle>Logs de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.event}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString("pt-BR")}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SecurityTab;
