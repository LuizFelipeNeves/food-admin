"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { trpc } from "@/app/_trpc/client";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  
  const { mutateAsync: verifyEmailMutation } = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus("success");
    },
    onError: (error) => {
      setStatus("error");
      toast.error(error.message || "Erro ao verificar email");
    },
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await verifyEmailMutation({ token });
      } catch (error) {
        // Erro já tratado no onError do mutation
      }
    };

    verifyToken();
  }, [token, verifyEmailMutation]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verificando seu email</h2>
          <div className="mt-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-4 text-gray-600">Estamos confirmando seu email, por favor aguarde...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Link inválido</h2>
          <p className="mt-2 text-sm text-gray-600">
            O link de verificação é inválido ou expirou.
          </p>
          <div className="mt-4">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email verificado!</h2>
          <p className="mt-2 text-gray-600">
            Sua conta foi ativada com sucesso.
          </p>
        </div>
        
        <div className="mt-8 bg-green-50 p-4 rounded-md border border-green-200">
          <p className="text-green-800 font-medium">Verificação concluída</p>
          <p className="text-green-700 mt-2">
            Agora você pode fazer login e aproveitar todos os recursos da plataforma.
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
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
} 