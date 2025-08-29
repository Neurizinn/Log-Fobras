import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { 
  ChevronLeft, 
  Download, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Truck,
  Package,
  MapPin
} from "lucide-react";
import { Link } from "wouter";
import { type OperationWithRelations } from "@shared/schema";

export default function Reports() {
  const { data: operations = [] } = useQuery<OperationWithRelations[]>({
    queryKey: ["/api/operations"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Calculate daily operations (completed today)
  const today = new Date().toDateString();
  const dailyOperations = operations.filter(op => 
    op.actualEndTime && new Date(op.actualEndTime).toDateString() === today
  ).length;

  // Calculate average operation time (mock calculation)
  const avgOperationTime = "2.3h";
  
  // Count active issues (operations taking longer than expected)
  const activeIssues = operations.filter(op => 
    (op.status === "loading" || op.status === "unloading") && 
    op.actualStartTime && 
    (Date.now() - new Date(op.actualStartTime).getTime()) > 4 * 60 * 60 * 1000 // > 4 hours
  ).length;

  // Recent completed operations
  const recentOperations = operations
    .filter(op => op.status === "completed")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "loading":
      case "unloading":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "loading":
        return "Carregamento";
      case "unloading":
        return "Descarga";
      default:
        return status;
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}min`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Reports Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          </div>
          <Button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Dados
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Operações Diárias</h3>
                <p className="text-gray-600 text-sm">Movimentação de hoje</p>
              </div>
              <BarChart3 className="text-blue-500 text-2xl w-8 h-8" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">{dailyOperations}</div>
              <div className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% desde ontem
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eficiência</h3>
                <p className="text-gray-600 text-sm">Tempo médio por operação</p>
              </div>
              <Clock className="text-green-500 text-2xl w-8 h-8" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">{avgOperationTime}</div>
              <div className="text-sm text-green-600">-15min desde ontem</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ocorrências</h3>
                <p className="text-gray-600 text-sm">Problemas registrados</p>
              </div>
              <AlertTriangle className="text-yellow-500 text-2xl w-8 h-8" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">{activeIssues}</div>
              <div className="text-sm text-yellow-600">
                {Math.max(0, activeIssues - 1)} resolvidas
              </div>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimentação Semanal</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">Gráfico de movimentação semanal</p>
              <p className="text-sm">Dados de operações dos últimos 7 dias</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOperations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma atividade recente</p>
                    </td>
                  </tr>
                ) : (
                  recentOperations.map(operation => (
                    <tr key={operation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {operation.updatedAt ? new Date(operation.updatedAt).toLocaleString('pt-BR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{operation.vehicle.plate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {operation.type === "loading" ? "Carregamento" : "Descarga"} - {operation.material.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(operation.status)}>
                          {getStatusText(operation.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {operation.actualStartTime && operation.actualEndTime
                          ? calculateDuration(operation.actualStartTime, operation.actualEndTime)
                          : operation.actualStartTime
                          ? `${Math.floor((Date.now() - new Date(operation.actualStartTime).getTime()) / (1000 * 60 * 60))}h em andamento`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
