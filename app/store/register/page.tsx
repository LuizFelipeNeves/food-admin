'use client';

import { useRouter } from 'next/navigation';
import { StoreRegistrationForm } from '@/components/forms/StoreRegistrationForm';

export default function StoreRegistrationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
    router.refresh(); // Força o refresh para atualizar o estado da aplicação
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Registre sua Empresa</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para começar a usar o sistema
        </p>
      </div>

      <StoreRegistrationForm onSuccess={handleSuccess} />
    </div>
  );
} 