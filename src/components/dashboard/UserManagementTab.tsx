import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { adminGetUsers, type UserProfile } from "@/lib/api";

/**
 * UserManagementTab - Uses RPC instead of direct supabase.from()
 */
export const UserManagementTab = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminGetUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-secondary text-secondary-foreground">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "client":
        return (
          <Badge variant="outline">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Client
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="kitara-card">
        <CardHeader>
          <CardTitle className="font-cinzel text-secondary">Gerenciamento de Usuários</CardTitle>
          <CardDescription>Dados obtidos via RPC admin_get_users (sem acesso direto)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 kitara-input"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="kitara-card">
        <CardHeader>
          <CardTitle className="font-cinzel text-secondary">Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum usuário encontrado</p>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="bg-background/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.email}</p>
                        {getRoleBadge(user.role)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.display_name || "Sem nome"} • MFA: {user.mfa_enabled ? "Ativo" : "Inativo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cadastro: {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
