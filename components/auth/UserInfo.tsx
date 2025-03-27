"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function UserInfo({ showLogout = true }: { showLogout?: boolean }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Entrar
        </Link>
        <Link 
          href="/auth/register"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Criar conta
        </Link>
      </div>
    );
  }

  const userRole = session.user.role || "user";
  const roleName = {
    user: "Usuário",
    employee: "Funcionário",
    admin: "Administrador",
  }[userRole];

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
          {session.user.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <p className="text-gray-800 font-medium">{session.user.name}</p>
          <p className="text-xs text-gray-500">{roleName}</p>
        </div>
      </div>
      
      {showLogout && (
        <LogoutButton variant="small" />
      )}
    </div>
  );
} 