import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CargoCard } from "@/components/cargo-card";
import { 
  ArrowLeft, 
  Calendar, 
  DoorOpen, 
  TruckIcon, 
  Package,
  Truck
} from "lucide-react";
import { type OperationWithRelations } from "@shared/schema";

export default function SimplifiedView() {
  const { data: operations = [] } = useQuery<OperationWithRelations[]>({
    queryKey: ["/api/operations"],
  });

  const scheduledOps = operations.filter(op => op.status === "scheduled");
  const gateOps = operations.filter(op => op.status === "at_gate");
  const loadingOps = operations.filter(op => op.status === "loading");
  const unloadingOps = operations.filter(op => op.status === "unloading");

  const currentTime = new Date().toLocaleTimeString('pt-BR');

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* TV Display Header */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Centro de Operações - Tempo Real</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Última atualização</div>
            <div className="text-lg font-semibold text-gray-900">{currentTime}</div>
          </div>
          <Link href="/">
            <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg">
              <ArrowLeft className="text-gray-600 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Four Quadrants Layout */}
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-120px)]">
        {/* Agendamentos Quadrant */}
        <div className="scheduled-section rounded-xl p-6 overflow-y-auto border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Calendar className="text-white text-xl w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Agendamentos</h2>
              <p className="text-blue-700">Próximas chegadas</p>
            </div>
          </div>

          {scheduledOps.length === 0 ? (
            <div className="text-center text-blue-600 py-8">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento no momento</p>
            </div>
          ) : (
            scheduledOps.map(operation => (
              <CargoCard
                key={operation.id}
                operation={operation}
                variant="simplified"
              />
            ))
          )}
        </div>

        {/* Portaria Quadrant */}
        <div className="gate-section rounded-xl p-6 overflow-y-auto border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DoorOpen className="text-white text-xl w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-900">Portaria</h2>
              <p className="text-green-700">Veículos na entrada</p>
            </div>
          </div>

          {gateOps.length === 0 ? (
            <div className="text-center text-green-600 py-8">
              <DoorOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum veículo na portaria</p>
            </div>
          ) : (
            gateOps.map(operation => (
              <CargoCard
                key={operation.id}
                operation={operation}
                variant="simplified"
              />
            ))
          )}
        </div>

        {/* Carregamentos Quadrant */}
        <div className="loading-section rounded-xl p-6 overflow-y-auto border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <TruckIcon className="text-white text-xl w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-900">Carregamentos</h2>
              <p className="text-yellow-700">Em processo de carga</p>
            </div>
          </div>

          {loadingOps.length === 0 ? (
            <div className="text-center text-yellow-600 py-8">
              <TruckIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum carregamento ativo</p>
            </div>
          ) : (
            loadingOps.map(operation => (
              <CargoCard
                key={operation.id}
                operation={operation}
                variant="simplified"
              />
            ))
          )}
        </div>

        {/* Descargas Quadrant */}
        <div className="unloading-section rounded-xl p-6 overflow-y-auto border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Package className="text-white text-xl w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900">Descargas</h2>
              <p className="text-red-700">Em processo de descarga</p>
            </div>
          </div>

          {unloadingOps.length === 0 ? (
            <div className="text-center text-red-600 py-8">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma descarga ativa</p>
            </div>
          ) : (
            unloadingOps.map(operation => (
              <CargoCard
                key={operation.id}
                operation={operation}
                variant="simplified"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
