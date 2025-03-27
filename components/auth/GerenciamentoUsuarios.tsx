"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { trpc } from "@/app/_trpc/client";

// Schema para criar funcionário/admin
const NovoUsuarioSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  phone: z.string().optional(),
  role: z.enum(["employee", "admin"]),
});

type NovoUsuarioData = z.infer<typeof NovoUsuarioSchema>;
type Role = "user" | "employee" | "admin";

export function GerenciamentoUsuarios() {
  const [pagina, setPagina] = useState(1);
  const [filtroRole, setFiltroRole] = useState<Role | undefined>(undefined);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);

  // Queries e Mutations
  const { data, isLoading, refetch } = trpc.auth.listUsers.useQuery({
    page: pagina,
    limit: 10,
    role: filtroRole,
  });

  const { mutateAsync: createStaffMutation } = trpc.auth.createStaff.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      refetch();
      setMostrarFormulario(false);
      reset();
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar usuário");
      setLoading(false);
    },
  });

  const { mutateAsync: updateRoleMutation } = trpc.auth.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Nível de acesso atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar nível de acesso");
    },
  });

  const { mutateAsync: toggleStatusMutation } = trpc.auth.toggleUserStatus.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`Usuário ${variables.isActive ? "ativado" : "desativado"} com sucesso!`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  // Form para criar funcionário/admin
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NovoUsuarioData>({
    resolver: zodResolver(NovoUsuarioSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "employee",
    },
  });

  // Handlers
  const onSubmit = async (data: NovoUsuarioData) => {
    setLoading(true);
    try {
      await createStaffMutation(data);
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await updateRoleMutation({ userId, role: newRole });
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  const handleToggleStatus = async (userId: string, isCurrentlyActive: boolean) => {
    try {
      await toggleStatusMutation({ userId, isActive: !isCurrentlyActive });
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {mostrarFormulario ? "Cancelar" : "Adicionar Funcionário/Admin"}
        </button>
      </div>

      {/* Formulário para criar funcionário/admin */}
      {mostrarFormulario && (
        <div className="bg-gray-50 p-4 rounded-md mb-6 border">
          <h3 className="text-lg font-medium mb-4">Novo Funcionário/Administrador</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (opcional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de acesso
                </label>
                <select
                  id="role"
                  {...register("role")}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="employee">Funcionário</option>
                  <option value="admin">Administrador</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? "Criando..." : "Criar Usuário"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
        <select
          value={filtroRole || ""}
          onChange={(e) => setFiltroRole(e.target.value === "" ? undefined : e.target.value as Role)}
          className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="user">Usuários</option>
          <option value="employee">Funcionários</option>
          <option value="admin">Administradores</option>
        </select>
      </div>

      {/* Tabela de usuários */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Nome</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Nível</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{user.name}</td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value as Role)}
                        className="px-2 py-1 border rounded-md text-sm"
                      >
                        <option value="user">Usuário</option>
                        <option value="employee">Funcionário</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        className={`px-3 py-1 rounded-md text-xs text-white ${
                          user.isActive
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {user.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {data && (
            <div className="flex justify-between items-center mt-4">
              <div>
                <span className="text-sm text-gray-700">
                  Mostrando {data.users.length} de {data.pagination.total} usuários
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagina(Math.max(1, pagina - 1))}
                  disabled={pagina === 1}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagina(Math.min(data.pagination.pages, pagina + 1))}
                  disabled={pagina >= data.pagination.pages}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 