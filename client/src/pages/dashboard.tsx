import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { 
  Tv, 
  ChartLine, 
  PlusCircle,
  Logs,
  FileChartPie,
  Calendar,
  DoorOpen,
  TruckIcon,
  Package
} from "lucide-react";

export default function Dashboard() {
  const { hasPermission } = useAuth()
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  console.log(stats)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Painel de Controle</h2>
            <p className="text-gray-600">Selecione a área que deseja acessar</p>
          </div>

          {/* Main Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            {/* Visualização Simplificada */}

            {hasPermission("simplified:view") && (
              <Link href="/simplified-view">
                <Button
                  variant="ghost"
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 text-left group h-auto flex flex-col items-start w-full whitespace-normal"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Tv className="text-primary text-xl w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Simplificado</h3>
                  <p className="text-gray-600 text-sm text-left">Painel para exibição em TVs com status em tempo real</p>
                </Button>
              </Link>
            )}

            {/* Visualização Completa */}
            {hasPermission("complete:view") && (
              <Link href="/complete-view">
                <Button
                  variant="ghost"
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 text-left group h-auto flex flex-col items-start w-full whitespace-normal"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <ChartLine className="text-green-600 text-xl w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h3>
                  <p className="text-gray-600 text-sm text-left">Interface técnica com controles avançados</p>
                </Button>
              </Link>
            )}

            {/* Cadastros */}
            {hasPermission("dashboard:edit") && (
              <Link href="/registrations">
                <Button
                  variant="ghost"
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 text-left group h-auto flex flex-col items-start w-full whitespace-normal"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                    <PlusCircle className="text-yellow-600 text-xl w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Cadastros</h3>
                  <p className="text-gray-600 text-sm text-left">Registrar veículos, materiais e gerenciar permissões</p>
                </Button>
              </Link>
            )}

            {/* Relatórios */}

            {hasPermission("report:view") && (
              <Link href="/reports">
                <Button
                  variant="ghost"
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 text-left group h-auto flex flex-col items-start w-full whitespace-normal"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <FileChartPie className="text-purple-600 text-xl w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Relatórios</h3>
                  <p className="text-gray-600 text-sm text-left">Análises e estatísticas de operações</p>
                </Button>
              </Link>
            )}

            {hasPermission("logs:view") && (
              <Link href="/logs">
                <Button
                  variant="ghost"
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 text-left group h-auto flex flex-col items-start w-full whitespace-normal"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                    <Logs className="text-yellow-600 text-xl w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Logs</h3>
                  <p className="text-gray-600 text-sm text-left">Visualizar Logs de erros, informações e debug</p>
                </Button>
              </Link>
            )}
          </div>

          {/* Quick Stats */}
          {hasPermission("dashboard:view") && (
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Atual</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="scheduled-section rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Agendamentos</p>
                      <p className="text-2xl font-bold text-blue-900">{stats?.scheduled || 0}</p>
                    </div>
                    <Calendar className="text-blue-500 text-2xl w-8 h-8" />
                  </div>
                </div>
                <div className="gate-section rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Na Portaria</p>
                      <p className="text-2xl font-bold text-green-900">{stats?.atGate || 0}</p>
                    </div>
                    <DoorOpen className="text-green-500 text-2xl w-8 h-8" />
                  </div>
                </div>
                <div className="loading-section rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Carregando</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats?.loading || 0}</p>
                    </div>
                    <TruckIcon className="text-yellow-500 text-2xl w-8 h-8" />
                  </div>
                </div>
                <div className="unloading-section rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Descarregando</p>
                      <p className="text-2xl font-bold text-red-900">{stats?.unloading || 0}</p>
                    </div>
                    <Package className="text-red-500 text-2xl w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
