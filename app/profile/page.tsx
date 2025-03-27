import { PerfilUsuario } from "@/components/auth/PerfilUsuario";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 px-4 sm:px-0">Meu Perfil</h1>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <PerfilUsuario />
        </div>
      </div>
    </div>
  );
} 