import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, type User } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  checkAuthStatus: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const result = await authService.getCurrentUser();
      setUser(result?.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, name: string) => {
    try {
      const result = await authService.login(email, name);
      setUser(result.user);
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${result.user.name}!`,
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Não foi possível realizar o login. Verifique suas credenciais.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission) || user.role === "admin";
  };

  const refreshUser = async () => {
    try {
      const result = await authService.getCurrentUser();
      setUser(result?.user || null);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission, checkAuthStatus, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
