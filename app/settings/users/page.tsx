import { GerenciamentoUsuarios } from '@/components/auth/GerenciamentoUsuarios';
import { Layout } from '@/components/layout/layout';

export default function UsersPage() {
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 max-w-[2000px] mx-auto">
        <GerenciamentoUsuarios />
      </div>
    </Layout>
  );
} 