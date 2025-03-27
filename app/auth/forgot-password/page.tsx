"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { trpc } from "@/app/_trpc/client";

const EsqueceuSenhaSchema = z.object({
  email: z.string().email("Por favor, informe um email válido"),
});

type EsqueceuSenhaData = z.infer<typeof EsqueceuSenhaSchema>;

export default function EsqueceuSenhaPage() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  
  const { mutateAsync: forgotPasswordMutation } = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setEnviado(true);
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao processar solicitação");
      setLoading(false);
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<EsqueceuSenhaData>({
    resolver: zodResolver(EsqueceuSenhaSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: EsqueceuSenhaData) => {
    setLoading(true);
    try {
      await forgotPasswordMutation({ email: data.email });
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Recuperação de senha</h2>
          {!enviado && (
            <p className="mt-2 text-sm text-gray-600">
              Digite seu email para receber um link de recuperação de senha
            </p>
          )}
        </div>
        
        {enviado ? (
          <div className="mt-8 bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-green-800 font-medium">
              Instruções enviadas para seu email
            </p>
            <p className="text-green-700 mt-2">
              Se o email informado estiver registrado em nossa plataforma, você receberá um link para redefinir sua senha em instantes.
            </p>
            <div className="mt-4">
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Voltar para o login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? "Processando..." : "Enviar link de recuperação"}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 