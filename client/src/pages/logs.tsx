import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { 
  Search, 
  Filter, 
  RefreshCw,
  ChevronLeft,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
  Trash2
} from "lucide-react";
import { Link } from "wouter";
import { type Log } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { clientLogger } from "@/lib/logger";

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [limit, setLimit] = useState(100);
  const { toast } = useToast();

  const { data: logs = [], isLoading, refetch } = useQuery<Log[]>({
    queryKey: ["/api/logs", limit, levelFilter, sourceFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (levelFilter && levelFilter !== "all") params.append("level", levelFilter);
      if (sourceFilter && sourceFilter !== "all") params.append("source", sourceFilter);
      
      const response = await apiRequest("GET", `/api/logs?${params.toString()}`);
      return response.json();
    },
    refetchInterval: 5000,
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const cleanupOldLogs = async () => {
    try {
      await apiRequest("DELETE", "/api/logs/cleanup?days=7");
      toast({
        title: "Logs limpos",
        description: "Logs mais antigos que 7 dias foram removidos",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível limpar os logs",
        variant: "destructive",
      });
    }
  };

  const testClientLogging = () => {
    clientLogger.info("Teste de log info do cliente");
    clientLogger.warn("Teste de log warning do cliente");
    clientLogger.error("Teste de log error do cliente");
    clientLogger.logUserAction("Teste do sistema de logs", { page: "logs" });
    toast({
      title: "Logs de teste enviados",
      description: "Verifique os logs abaixo",
    });
    setTimeout(() => refetch(), 1000);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warn":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "debug":
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "warn":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "debug":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSourceColor = (source: string) => {
    return source === "server" 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-purple-100 text-purple-800 border-purple-200";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const formatDetails = (details: string | null) => {
    if (!details) return null;
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Logs</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={testClientLogging} variant="outline" size="sm">
              Testar Logs
            </Button>
            <Button onClick={cleanupOldLogs} variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Logs Antigos
            </Button>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar em mensagem ou detalhes..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  <SelectItem value="server">Servidor</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={limit.toString()} onValueChange={(val) => setLimit(parseInt(val))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Limite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Nenhum log encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <Badge className={getSourceColor(log.source)}>
                            {log.source === "server" ? "SERVIDOR" : "CLIENTE"}
                          </Badge>
                          {log.requestId && (
                            <Badge variant="outline" className="text-xs">
                              {log.requestId}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-900 font-medium mb-1">{log.message}</p>
                        
                        {log.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                              Ver detalhes
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                              {formatDetails(log.details)}
                            </pre>
                          </details>
                        )}
                        
                        {log.stackTrace && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                              Ver stack trace
                            </summary>
                            <pre className="mt-2 p-3 bg-red-50 rounded text-xs overflow-x-auto text-red-700">
                              {log.stackTrace}
                            </pre>
                          </details>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <div>📅 {formatTimestamp(log.createdAt!)}</div>
                          {log.userId && <div>👤 User ID: {log.userId}</div>}
                          {log.ipAddress && <div>🌐 IP: {log.ipAddress}</div>}
                          {log.userAgent && (
                            <div className="truncate">🖥️ {log.userAgent}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}