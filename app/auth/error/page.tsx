"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthError } from "@/app/components/auth/AuthError";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "Ocorreu um erro durante a autenticação";

  switch (error) {
    case "OAuthCallback":
      errorMessage = "Ocorreu um erro no processo de autenticação com provedor externo";
      break;
    case "OAuthAccountNotLinked":
      errorMessage = "Esta conta já está vinculada a outra conta de usuário";
      break;
    case "SessionRequired":
      errorMessage = "Você precisa estar autenticado para acessar esta página";
      break;
    case "Verification":
      errorMessage = "O link de verificação expirou ou é inválido";
      break;
    case "CredentialsSignin":
      errorMessage = "Email ou senha incorretos";
      break;
    default:
      if (error) {
        errorMessage = error;
      }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Erro de Autenticação</h2>
          <div className="mt-6">
            <AuthError message={errorMessage} />
          </div>
          <div className="mt-6 flex flex-col space-y-4">
            <Link 
              href="/auth/login"
              className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voltar para o login
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Ir para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Carregando...</p>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
} 