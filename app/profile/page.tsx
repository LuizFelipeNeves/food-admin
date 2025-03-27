import { PerfilUsuario } from "@/components/auth/PerfilUsuario";
import { Layout } from "@/components/layout/layout";

export default function ProfilePage() {
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>
        <div className="bg-card rounded-lg border shadow-sm">
          <PerfilUsuario />
        </div>
      </div>
    </Layout>
  );
} 