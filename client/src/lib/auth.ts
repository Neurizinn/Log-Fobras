import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export const authService = {
  async login(email: string, name: string): Promise<{ user: User }> {
    const response = await apiRequest("POST", "/api/auth/login", { email, name });
    return response.json();
  },

  async logout(): Promise<void> {
    await apiRequest("POST", "/api/auth/logout");
  },

  async getCurrentUser(): Promise<{ user: User } | null> {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      return response.json();
    } catch (error) {
      return null;
    }
  },

  // Mock Microsoft OAuth flow - in production this would integrate with Microsoft Graph
  async mockMicrosoftLogin(): Promise<{ email: string; name: string }> {
    // This simulates the Microsoft OAuth flow
    // In production, you would use MSAL.js or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful login
        resolve({
          email: "usuario@empresa.com",
          name: "Usuário Teste"
        });
      }, 1000);
    });
  }
};
