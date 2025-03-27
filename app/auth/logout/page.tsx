"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    async function performLogout() {
      try {
        await signOut({ redirect: false });
        router.push("/auth/login");
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        setIsLoggingOut(false);
      }
    }

    performLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        {isLoggingOut ? (
          <>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Saindo...</h2>
            <div className="mt-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="mt-4 text-gray-600">Finalizando sua sessão, por favor aguarde...</p>
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Erro ao sair</h2>
            <p className="mt-2 text-gray-600">
              Ocorreu um erro ao finalizar sua sessão. Por favor, tente novamente.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setIsLoggingOut(true);
                  signOut({ redirect: true, callbackUrl: "/auth/login" });
                }}
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Tentar novamente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 