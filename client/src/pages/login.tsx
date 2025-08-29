import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/lib/auth";
import { Truck, Shield } from "lucide-react";
import { Building } from "lucide-react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      const tenantId = "7f6df389-4d9f-4f42-9469-440704f55abe"; // seu Tenant ID
      const clientId = "0cd62e78-c77c-40b9-9956-b0ec588a3149"; // seu Client ID
      const redirectUri = "http://localhost:5000/auth/callback";

      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_mode=query&scope=openid profile email`;

      // Redireciona o navegador para o login da Microsoft
      window.location.href = authUrl;


      // // In production, this would integrate with Microsoft Graph API
      // const { email, name } = await authService.mockMicrosoftLogin();
      // await login(email, name);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8">
          {/* Company Logo Area */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Truck className="text-white text-2xl w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Cargas</h1>
            <p className="text-gray-600">Controle de Carregamentos e Descargas</p>
          </div>

          {/* Microsoft Login Button */}
          <Button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 mb-4"
          >
            <Building className="text-xl" />
            {isLoading ? "Entrando..." : "Entrar com Microsoft"}
          </Button>

          {/* Security Notice */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 text-center">
            <Shield className="inline mr-2 w-4 h-4 text-gray-500" />
            Acesso restrito a funcionários autorizados
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
