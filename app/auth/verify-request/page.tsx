"use client";

import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verifique seu email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enviamos um link de verificação para o seu email
          </p>
        </div>
        
        <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-200">
          <p className="text-blue-800 font-medium">Instruções enviadas</p>
          <p className="text-blue-700 mt-2">
            Acesse sua caixa de entrada e clique no link que enviamos para verificar sua conta.
            Se não encontrar o email, verifique também a pasta de spam.
          </p>
          <div className="mt-4">
            <ul className="text-blue-700 space-y-2 list-disc list-inside">
              <li>O link é válido por 24 horas</li>
              <li>Você precisa verificar seu email para acessar a plataforma</li>
            </ul>
          </div>
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Voltar para a página de login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 