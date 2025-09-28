import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Smartphone,
  Key,
  Activity,
  Lock,
  Unlock,
  Calendar
} from "lucide-react";
import { SecuritySettings } from "@/components/security/SecuritySettings";
import { TwoFactorVerify } from "@/components/security/TwoFactorVerify";
import { useSecurity } from "@/hooks/useSecurity";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SecurityService, DEFAULT_ADMIN_CREDENTIALS } from "@/lib/security";

interface SecurityTabProps {
  userId: string;
}

export const SecurityTab = ({ userId }: SecurityTabProps) => {
  const { user, profile } = useAuth();
  const { securityState, enable2FA, disable2FA, addLoginAttempt } = useSecurity(userId);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('settings');

  // Mock data para demonstração
  const [securityLogs] = useState([
    {
      id: '1',
      user: 'admin@moskino.circo',
      event: 'Login successful',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      ip: '192.168.1.100',
      device: 'Chrome/Linux',
      status: 'success'
    },
    {
      id: '2',
      user: 'cliente1@email.com',
      event: '2FA verification failed',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      ip: '10.0.0.50',
      device: 'Safari/iOS',
      status: 'failed'
    },
    {
      id: '3',
      user: 'cliente2@email.com',
      event: 'Account locked',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      ip: '203.45.67.89',
      device: 'Firefox/Windows',
      status: 'blocked'
    },
    {
      id: '4',
      user: 'admin@moskino.circo',
      event: '2FA enabled',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      ip: '192.168.1.100',
      device: 'Chrome/Linux',
      status: 'config'
    }
  ]);

  const [userSecurityStats] = useState([
    { user: 'admin@moskino.circo', has2FA: true, lastLogin: new Date(), attempts: 0, status: 'active' },
    { user: 'cliente1@email.com', has2FA: false, lastLogin: new Date(Date.now() - 60 * 60 * 1000), attempts: 3, status: 'warning' },
    { user: 'cliente2@email.com', has2FA: false, lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), attempts: 5, status: 'locked' }
  ]);

  const handleToggle2FA = (enabled: boolean, secret?: string, backupCodes?: string[]) => {
    if (enabled && secret && backupCodes) {
      enable2FA(secret, backupCodes);
    } else {
      disable2FA();
    }
  };

  const handleUnlockUser = (userEmail: string) => {
    toast({
      title: "Conta Desbloqueada",
      description: `Conta ${userEmail} foi desbloqueada pelo administrador`,
    });
  };

  const handleForceLogout = (userEmail: string) => {
    toast({
      title: "Logout Forçado",
      description: `${userEmail} foi desconectado de todas as sessões`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sucesso</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Falhou</Badge>;
      case 'blocked':
        return <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Bloqueado</Badge>;
      case 'config':
        return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Config</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Atenção</Badge>;
      case 'locked':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-muted-foreground">Total de Usuários</p>
                <p className="text-3xl font-bungee text-primary">3</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-muted-foreground">Com 2FA Ativo</p>
                <p className="text-3xl font-bungee text-green-500">1</p>
              </div>
              <Smartphone className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-muted-foreground">Contas Bloqueadas</p>
                <p className="text-3xl font-bungee text-red-500">1</p>
              </div>
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="settings" className="font-fredoka data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="h-4 w-4 mr-2" />
            Minhas Configurações
          </TabsTrigger>
          <TabsTrigger value="users" className="font-fredoka data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-4 w-4 mr-2" />
            Gerenciar Usuários
          </TabsTrigger>
          <TabsTrigger value="logs" className="font-fredoka data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="h-4 w-4 mr-2" />
            Logs de Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <SecuritySettings
            userEmail={user?.email || 'admin@moskino.circo'}
            has2FA={securityState.has2FA}
            loginAttempts={securityState.loginAttempts.length}
            lastLogin={new Date()}
            onToggle2FA={handleToggle2FA}
          />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-bungee text-primary">Gerenciamento de Usuários 👥</CardTitle>
              <CardDescription className="font-fredoka">
                Gerencie a segurança e acesso dos usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-fredoka">Usuário</TableHead>
                    <TableHead className="font-fredoka">2FA</TableHead>
                    <TableHead className="font-fredoka">Último Login</TableHead>
                    <TableHead className="font-fredoka">Tentativas</TableHead>
                    <TableHead className="font-fredoka">Status</TableHead>
                    <TableHead className="font-fredoka">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSecurityStats.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-fredoka">{user.user}</TableCell>
                      <TableCell>
                        {user.has2FA ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-fredoka text-sm">
                        {user.lastLogin.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.attempts > 3 ? "destructive" : "outline"}>
                          {user.attempts}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getUserStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.status === 'locked' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnlockUser(user.user)}
                            >
                              <Unlock className="h-3 w-3 mr-1" />
                              Desbloquear
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleForceLogout(user.user)}
                          >
                            Desconectar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-bungee text-primary">Logs de Segurança 📋</CardTitle>
              <CardDescription className="font-fredoka">
                Histórico de eventos de segurança e autenticação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-fredoka">Usuário</TableHead>
                    <TableHead className="font-fredoka">Evento</TableHead>
                    <TableHead className="font-fredoka">Data/Hora</TableHead>
                    <TableHead className="font-fredoka">IP</TableHead>
                    <TableHead className="font-fredoka">Dispositivo</TableHead>
                    <TableHead className="font-fredoka">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-fredoka font-medium">{log.user}</TableCell>
                      <TableCell className="font-fredoka">{log.event}</TableCell>
                      <TableCell className="font-fredoka text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {log.timestamp.toLocaleString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="font-fredoka text-sm text-muted-foreground">
                        {log.ip}
                      </TableCell>
                      <TableCell className="font-fredoka text-sm text-muted-foreground">
                        {log.device}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};