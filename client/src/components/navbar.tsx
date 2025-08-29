import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Truck, LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="text-white w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Sistema de Cargas</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">{user?.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-500 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
