import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertVehicleSchema, insertMaterialSchema, type User } from "@shared/schema";
import { ChevronLeft, Truck, Package, UserCog, Save, X } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Registrations() {
  const { checkAuthStatus, hasPermission, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState("vehicles");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Vehicle form
  const vehicleForm = useForm({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      plate: "",
      type: "truck" as const,
      trailerPlate: "",
      capacity: undefined,
      transportCompany: "",
      primaryDriver: "",
      notes: "",
    },
  });

  // Material form
  const materialForm = useForm({
    resolver: zodResolver(insertMaterialSchema),
    defaultValues: {
      name: "",
      category: "",
      unit: "toneladas",
      specificWeight: undefined,
      riskClass: "Sem risco",
      description: "",
    },
  });

  const permsForm = useForm({
    defaultValues: {
      permissions: [] as string[],
    },
  })

  const updatePermissions = useMutation({
    mutationFn: async (data: string[]) => {
      if (!selectedUser) throw new Error("Nenhum usuário selecionado");

      const response = await apiRequest(
        "PUT",
        `/api/users/${selectedUser.id}/permissions`,
        { permissions: data }
      );

      await refreshUser();
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissões atualizadas",
        description: "As permissões do usuário foram salvas com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as permissões",
        variant: "destructive",
      });
    },
  });


  // Mutations
  const createVehicleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/vehicles", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Veículo cadastrado",
        description: "Veículo cadastrado com sucesso!",
      });
      vehicleForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar veículo",
        variant: "destructive",
      });
    },
  });

  const createMaterialMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/materials", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Material cadastrado",
        description: "Material cadastrado com sucesso!",
      });
      materialForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar material",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    checkAuthStatus()
    if (selectedUser) {
      permsForm.reset({
        permissions: selectedUser.permissions || [],
      });
    }
  }, [selectedUser, permsForm]);

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      return res.json(); // retorna array de usuários
    },
  });

  const allPermissions = [
    { value: "dashboard:view", label: "Visualizar Dashboard" },
    { value: "dashboard:edit", label: "Editar Dashboard" },
    { value: "simplified:view", label: "Visão Simplificada"},
    { value: "complete:view", label: "Visão Completa"},
    { value: "complete:create", label: "Cria Visão Completa"},
    { value: "complete:edit", label: " Editar Visão Completa"},
    { value: "complete:delete", label: "Excluir Visão Completa"},
    { value: "register:vehicles", label: "Cadastro de Veículos"},
    { value: "register:materials", label: "Cadastro de Materiais"},
    { value: "register:perms", label: "Cadastro de Permissões"},
    { value: "report:view", label: "Visualizar Relatório"},
    { value: "report:export", label: "Exportar Relatório"},
    { value: "report:management", label: "Gerencias de Relatório"},
    { value: "logs:view", label: "Visualizar Logs"}
  ];

  const onVehicleSubmit = (data: any) => {
    createVehicleMutation.mutate(data);
  };

  const onMaterialSubmit = (data: any) => {
    createMaterialMutation.mutate(data);
  };

  const watchVehicleType = vehicleForm.watch("type");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Registration Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Cadastros</h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Registration Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {hasPermission("register:vehicles") && (
                <TabsTrigger value="vehicles" className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Veículos
                </TabsTrigger>
              )}
              {hasPermission("register:materials") && (
                <TabsTrigger value="materials" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Materiais
                </TabsTrigger>
              )}
              {hasPermission("register:perms") && (
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <UserCog className="w-4 h-4" />
                  Permissões
                </TabsTrigger>
              )}
            </TabsList>

            {/* Vehicle Registration Form */}
            <TabsContent value="vehicles" className="p-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cadastro de Veículo</h3>
                
                <Form {...vehicleForm}>
                  <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={vehicleForm.control}
                        name="plate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Placa do Veículo *</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC-1234" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={vehicleForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Veículo *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="truck">Truck</SelectItem>
                                <SelectItem value="carreta">Carreta</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {watchVehicleType === "carreta" && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-3">Informações da Carreta</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={vehicleForm.control}
                            name="trailerPlate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Placa da Carreta</FormLabel>
                                <FormControl>
                                  <Input placeholder="DEF-5678" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vehicleForm.control}
                            name="capacity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Capacidade (ton)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="40" 
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={vehicleForm.control}
                        name="transportCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transportadora</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da empresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={vehicleForm.control}
                        name="primaryDriver"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motorista Principal</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do motorista" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={vehicleForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={3} 
                              placeholder="Informações adicionais sobre o veículo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        disabled={createVehicleMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {createVehicleMutation.isPending ? "Cadastrando..." : "Cadastrar Veículo"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => vehicleForm.reset()}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>

            {/* Material Registration Form */}
            <TabsContent value="materials" className="p-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cadastro de Material</h3>
                
                <Form {...materialForm}>
                  <form onSubmit={materialForm.handleSubmit(onMaterialSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={materialForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Material *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Cimento Portland" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={materialForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="construcao-civil">Construção Civil</SelectItem>
                                <SelectItem value="metais">Metais</SelectItem>
                                <SelectItem value="quimicos">Químicos</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={materialForm.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade de Medida</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="toneladas">Toneladas</SelectItem>
                                <SelectItem value="quilogramas">Quilogramas</SelectItem>
                                <SelectItem value="metros3">Metros³</SelectItem>
                                <SelectItem value="litros">Litros</SelectItem>
                                <SelectItem value="unidades">Unidades</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={materialForm.control}
                        name="specificWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso Específico</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="1.5" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={materialForm.control}
                        name="riskClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classe de Risco</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Sem risco">Sem risco</SelectItem>
                                <SelectItem value="Classe 1">Classe 1</SelectItem>
                                <SelectItem value="Classe 2">Classe 2</SelectItem>
                                <SelectItem value="Classe 3">Classe 3</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={materialForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={3} 
                              placeholder="Descrição detalhada do material"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        disabled={createMaterialMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {createMaterialMutation.isPending ? "Cadastrando..." : "Cadastrar Material"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => materialForm.reset()}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>

            {/* Permissions Management */}
            <TabsContent value="permissions" className="p-6">
              <div className="max-w-4xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gerenciamento de Permissões</h3>
                
                <div className="space-y-6">
                  {/* User Selection */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Usuário
                    </label>
                    <div className="flex gap-4">
                      <Select onValueChange={(value) => {
                        const user = usersData.find((u: any) => u.id === value);
                        setSelectedUser(user);
                      }}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecionar usuário..." />
                        </SelectTrigger>
                        <SelectContent>
                          {usersData?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} - {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                  {/* Permission Matrix */}
                  <Form {...permsForm}>
                    <form
                      onSubmit={permsForm.handleSubmit((data) => {
                        updatePermissions.mutate(data.permissions);
                      })}
                      className="space-y-6"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900">Matriz de Permissões</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          {allPermissions.map((perm) => (
                            <FormField
                              key={perm.value}
                              control={permsForm.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(perm.value)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, perm.value]);
                                        } else {
                                          field.onChange(
                                            field.value.filter((v: string) => v !== perm.value)
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{perm.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={updatePermissions.isPending}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {updatePermissions.isPending ? "Salvando..." : "Salvar Permissões"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => permsForm.reset()}>
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>

                  {/* <div className="flex gap-4">
                    <Button className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar Permissões
                    </Button>
                    <Button variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div> */}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
