import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck, UserX, Search, Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'cliente' | 'pendente';
  created_at: string;
}

export const UserManagementTab = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'block' | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Buscar profiles com roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles de cada usuário (após migração SQL)
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles' as any)
            .select('role')
            .eq('user_id', profile.id)
            .single();

          return {
            id: profile.id,
            email: profile.id,
            name: profile.name || 'Sem nome',
            phone: profile.phone || 'Sem telefone',
            role: (roleData as any)?.role || 'pendente',
            created_at: profile.created_at,
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Realtime updates
    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      let functionName = '';
      let successMessage = '';

      switch (actionType) {
        case 'approve':
          functionName = 'approve_user';
          successMessage = 'Usuário aprovado com sucesso!';
          break;
        case 'reject':
          functionName = 'reject_user';
          successMessage = 'Usuário rejeitado com sucesso!';
          break;
        case 'block':
          functionName = 'block_user';
          successMessage = 'Usuário bloqueado com sucesso!';
          break;
      }

      // @ts-ignore - Functions will be created by SQL migration
      const { error } = await (supabase.rpc as any)(functionName, {
        target_user_id: selectedUser.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: successMessage,
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error performing action:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
  );

  const pendingUsers = filteredUsers.filter((u) => u.role === 'pendente');
  const activeUsers = filteredUsers.filter((u) => u.role === 'cliente' || u.role === 'admin');

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'cliente':
        return <Badge variant="secondary"><CheckCircle2 className="w-3 h-3 mr-1" />Cliente</Badge>;
      case 'pendente':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Aprovar, rejeitar ou bloquear usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Aguardando Aprovação ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingUsers.map((user) => (
              <Card key={user.id} className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        {getRoleBadge(user.role)}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                      <p className="text-xs text-muted-foreground">
                        Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionType('approve');
                        }}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionType('reject');
                        }}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Ativos ({activeUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum usuário ativo</p>
          ) : (
            activeUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        {getRoleBadge(user.role)}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                    </div>
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionType('block');
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Bloquear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedUser && !!actionType} onOpenChange={() => {
        setSelectedUser(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' && 'Aprovar Usuário'}
              {actionType === 'reject' && 'Rejeitar Usuário'}
              {actionType === 'block' && 'Bloquear Usuário'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' && `Tem certeza que deseja aprovar ${selectedUser?.name}? O usuário receberá acesso completo ao aplicativo.`}
              {actionType === 'reject' && `Tem certeza que deseja rejeitar ${selectedUser?.name}? Esta ação não pode ser desfeita.`}
              {actionType === 'block' && `Tem certeza que deseja bloquear ${selectedUser?.name}? O usuário perderá acesso ao aplicativo.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
