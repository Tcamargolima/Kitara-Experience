import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface FakeUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  profile: 'admin' | 'cliente';
}

// Usuários fake para testes
const FAKE_USERS: FakeUser[] = [
  {
    id: "admin-user-id",
    email: "alice@gatepass.com",
    password: "123456",
    name: "Alice Wonderland",
    phone: "+55 11 99999-9999",
    profile: "admin"
  },
  {
    id: "cliente-user-id", 
    email: "joao@cliente.com",
    password: "123456",
    name: "João Silva",
    phone: "+55 11 88888-8888",
    profile: "cliente"
  }
];

export const useFakeAuth = () => {
  const [user, setUser] = useState<FakeUser | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário já está logado no localStorage
    const storedUser = localStorage.getItem("fakeAuthUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = FAKE_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("fakeAuthUser", JSON.stringify(foundUser));
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, error: "Credenciais inválidas. Use: alice@gatepass.com ou joao@cliente.com / 123456" };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("fakeAuthUser");
    navigate("/");
  };

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated
  };
};