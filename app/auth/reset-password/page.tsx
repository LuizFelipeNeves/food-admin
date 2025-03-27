"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { trpc } from "@/app/_trpc/client";

const RedefinirSenhaSchema = z.object({
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RedefinirSenhaData = z.infer<typeof RedefinirSenhaSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [concluido, setConcluido] = useState(false);
  
  // Verificar se há token
  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Link inválido</h2>
            <p className="mt-2 text-sm text-gray-600">
              O link de redefinição de senha é inválido ou expirou.
            </p>
            <div className="mt-4">
              <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Solicitar nova recuperação de senha
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { mutateAsync: resetPasswordMutation } = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setConcluido(true);
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao redefinir senha");
      setLoading(false);
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<RedefinirSenhaData>({
    resolver: zodResolver(RedefinirSenhaSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RedefinirSenhaData) => {
    setLoading(true);
    try {
      await resetPasswordMutation({
        token,
        password: data.password,
      });
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Redefinir senha</h2>
          {!concluido && (
            <p className="mt-2 text-sm text-gray-600">
              Crie uma nova senha para sua conta
            </p>
          )}
        </div>
        
        {concluido ? (
          <div className="mt-8 bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-green-800 font-medium">Senha redefinida com sucesso!</p>
            <p className="text-green-700 mt-2">
              Agora você pode fazer login com sua nova senha.
            </p>
            <div className="mt-4">
              <Link 
                href="/auth/login"
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ir para o login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nova senha
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="********"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar nova senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="********"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? "Processando..." : "Redefinir senha"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Carregando...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}