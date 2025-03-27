"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { trpc } from "@/app/_trpc/client";

// Schema para atualização de perfil
const PerfilSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().optional(),
});

// Schema para alterar senha
const SenhaSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PerfilData = z.infer<typeof PerfilSchema>;
type SenhaData = z.infer<typeof SenhaSchema>;

export function PerfilUsuario() {
  const [abaAtiva, setAbaAtiva] = useState<"perfil" | "senha">("perfil");
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [loadingSenha, setLoadingSenha] = useState(false);

  // Consulta para obter dados do perfil
  const { data: user, isLoading: isLoadingUser } = trpc.auth.getProfile.useQuery();

  // Mutations
  const { mutateAsync: updateProfileMutation } = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      setLoadingPerfil(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar perfil");
      setLoadingPerfil(false);
    },
  });

  const { mutateAsync: changePasswordMutation } = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setLoadingSenha(false);
      resetSenhaForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao alterar senha");
      setLoadingSenha(false);
    },
  });

  // Form para atualização de perfil
  const {
    register: registerPerfil,
    handleSubmit: handleSubmitPerfil,
    formState: { errors: errorsPerfil },
    reset: resetPerfilForm,
  } = useForm<PerfilData>({
    resolver: zodResolver(PerfilSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
    values: user ? {
      name: user.name,
      phone: user.phone || "",
    } : undefined,
  });

  // Form para alterar senha
  const {
    register: registerSenha,
    handleSubmit: handleSubmitSenha,
    formState: { errors: errorsSenha },
    reset: resetSenhaForm,
  } = useForm<SenhaData>({
    resolver: zodResolver(SenhaSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handlers
  const onSubmitPerfil = async (data: PerfilData) => {
    setLoadingPerfil(true);
    try {
      await updateProfileMutation(data);
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  const onSubmitSenha = async (data: SenhaData) => {
    setLoadingSenha(true);
    try {
      await changePasswordMutation({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">Carregando dados do perfil...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Meu Perfil</h2>
      
      {/* Abas */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setAbaAtiva("perfil")}
          className={`py-2 px-4 ${
            abaAtiva === "perfil"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Informações Pessoais
        </button>
        <button
          onClick={() => setAbaAtiva("senha")}
          className={`py-2 px-4 ${
            abaAtiva === "senha"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Alterar Senha
        </button>
      </div>
      
      {/* Conteúdo das Abas */}
      {abaAtiva === "perfil" ? (
        <div>
          <form onSubmit={handleSubmitPerfil(onSubmitPerfil)}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                {...registerPerfil("name")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errorsPerfil.name && (
                <p className="mt-1 text-sm text-red-600">{errorsPerfil.name.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">O email não pode ser alterado</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                id="phone"
                type="tel"
                {...registerPerfil("phone")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errorsPerfil.phone && (
                <p className="mt-1 text-sm text-red-600">{errorsPerfil.phone.message}</p>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loadingPerfil}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loadingPerfil ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <form onSubmit={handleSubmitSenha(onSubmitSenha)}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Senha atual
              </label>
              <input
                id="currentPassword"
                type="password"
                {...registerSenha("currentPassword")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errorsSenha.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errorsSenha.currentPassword.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nova senha
              </label>
              <input
                id="newPassword"
                type="password"
                {...registerSenha("newPassword")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errorsSenha.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errorsSenha.newPassword.message}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...registerSenha("confirmPassword")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errorsSenha.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errorsSenha.confirmPassword.message}</p>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loadingSenha}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loadingSenha ? "Alterando..." : "Alterar Senha"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 