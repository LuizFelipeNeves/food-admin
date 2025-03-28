'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/app/_trpc/client';
import { toast } from 'react-hot-toast';
import { Store, PlusCircle } from 'lucide-react';
import useCurrentStore from '@/hooks/useCurrentStore';

interface UserStore {
  _id: string;
  store: {
    _id: string;
    title: string;
    email: string;
    phone: string;
  };
  role: string;
}

export function StoreSelectionCard() {
  const router = useRouter();
  const { setStore } = useCurrentStore();
  const { data: userStores, isLoading } = trpc.auth.getUserStores.useQuery();

  const handleSelectStore = (store: UserStore['store']) => {
    setStore(store);
    toast.success('Empresa selecionada com sucesso!');
    router.push('/');
  };

  const handleCreateStore = () => {
    router.push('/store/register');
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Carregando...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Selecione uma Empresa</CardTitle>
        <CardDescription className="text-center">
          Escolha uma empresa para gerenciar ou crie uma nova
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userStores && userStores.length > 0 ? (
          <div className="space-y-2">
            {userStores.map((userStore) => (
              <Button
                key={userStore.store._id}
                variant="outline"
                className="w-full flex items-center justify-start space-x-2 h-auto py-4 px-4"
                onClick={() => handleSelectStore(userStore.store)}
              >
                <Store className="h-5 w-5 shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{userStore.store.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {userStore.role === 'owner' ? 'Proprietário' : 'Colaborador'}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Você ainda não tem nenhuma empresa cadastrada
          </div>
        )}

        <Button
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
          onClick={handleCreateStore}
        >
          <PlusCircle className="h-5 w-5" />
          <span>Criar Nova Empresa</span>
        </Button>
      </CardContent>
    </Card>
  );
} 