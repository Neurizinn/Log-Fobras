import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, Clock, MapPin, Package } from "lucide-react";
import { type OperationWithRelations } from "@shared/schema";

interface CargoCardProps {
  operation: OperationWithRelations;
  variant?: "simplified" | "detailed";
}

export function CargoCard({ operation, variant = "detailed" }: CargoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "at_gate":
        return "bg-green-100 text-green-800";
      case "loading":
        return "bg-yellow-100 text-yellow-800";
      case "unloading":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado";
      case "at_gate":
        return "Na Portaria";
      case "loading":
        return "Carregando";
      case "unloading":
        return "Descarregando";
      case "completed":
        return "Concluído";
      default:
        return status;
    }
  };

  if (variant === "simplified") {
    return (
      <Card className="bg-white rounded-lg shadow-sm mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Truck className="text-gray-500 w-5 h-5" />
              <div>
                <div className="font-semibold text-gray-900">{operation.vehicle.plate}</div>
                <div className="text-sm text-gray-600">
                  {operation.driver} - {operation.transportCompany}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {operation.scheduledDate ? new Date(operation.scheduledDate).toLocaleDateString('pt-BR') : 'Hoje'}
              </div>
              <div className="font-semibold text-primary">
                {operation.scheduledTime || 'Em andamento'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Destino:</span>
              <span className="font-medium">{operation.destination || operation.origin}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Material:</span>
              <span className="font-medium">{operation.material.name}</span>
            </div>
          </div>
          {(operation.status === "loading" || operation.status === "unloading") && (
            <div className="mt-3">
              <Progress value={operation.progress || 0} className="h-2 mb-1" />
              <div className="text-xs text-gray-600">{operation.progress || 0}% concluído</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Truck className="text-gray-500 w-5 h-5" />
            <div>
              <div className="font-semibold text-gray-900">{operation.vehicle.plate}</div>
              <div className="text-sm text-gray-600">
                {operation.driver} - {operation.transportCompany}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(operation.status)}>
            {getStatusText(operation.status)}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Material:</span>
            <span className="font-medium">{operation.material.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {operation.type === "loading" ? "Destino:" : "Origem:"}
            </span>
            <span className="font-medium">{operation.destination || operation.origin}</span>
          </div>
          
          {operation.scheduledTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Horário:</span>
              <span className="font-medium">{operation.scheduledTime}</span>
            </div>
          )}
          
          {operation.dockNumber && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Doca:</span>
              <span className="font-medium">{operation.dockNumber}</span>
            </div>
          )}
        </div>

        {(operation.status === "loading" || operation.status === "unloading") && (
          <div className="mt-3">
            <Progress value={operation.progress || 0} className="h-2 mb-1" />
            <div className="text-xs text-gray-600">{operation.progress || 0}% concluído</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
