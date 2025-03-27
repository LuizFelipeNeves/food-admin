import { GerenciamentoUsuarios } from "@/components/auth/GerenciamentoUsuarios";

export default function UsersAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 px-4 sm:px-0">Gerenciamento de Usuários</h1>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <GerenciamentoUsuarios />
        </div>
      </div>
    </div>
  );
} 