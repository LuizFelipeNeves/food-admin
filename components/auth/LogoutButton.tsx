"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

interface LogoutButtonProps {
  variant?: "default" | "small" | "icon" | "menu";
  className?: string;
}

export function LogoutButton({ variant = "default", className = "" }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Chamar signOut com callbackUrl para garantir o redirecionamento
      await signOut({ 
        redirect: true,
        callbackUrl: "/auth/login"
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
      setIsLoading(false);
    }
  };

  if (variant === "menu") {
    return (
      <DropdownMenuItem
        onClick={handleLogout}
        disabled={isLoading}
        className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>{isLoading ? "Saindo..." : "Sair"}</span>
      </DropdownMenuItem>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        aria-label="Sair"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        ) : (
          <LogOut className="h-5 w-5" />
        )}
      </button>
    );
  }

  if (variant === "small") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`px-3 py-1 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        {isLoading ? "Saindo..." : "Sair"}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${className}`}
    >
      {isLoading ? "Saindo..." : "Sair da conta"}
    </button>
  );
} 