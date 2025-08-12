'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import useCurrentStore from '@/hooks/useCurrentStore';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type Role = 'owner' | 'admin' | 'employee';

interface Store {
  _id: string;
  title: string;
  email: string;
  phone: string;
}

interface UserStore {
  _id: string;
  store: Store;
  role: Role;
  active: boolean;
}

interface StoresResponse {
  data: UserStore[];
  timestamp: string;
  fromCache: boolean;
}

const roleColors = {
  owner: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  admin: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  employee: 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
} as const;

const roleLabels = {
  owner: 'Proprietário',
  admin: 'Administrador',
  employee: 'Funcionário'
} as const;

export function StoreSelector() {
  const { setStore, isLoading: isStoreLoading, storeId, store } = useCurrentStore();
  const { data, isLoading: isLoadingStores } = trpc.stores.getUserStores.useQuery<StoresResponse>();

  const userStores = data?.data ?? [];
  const utils = trpc.useUtils();

  const handleStoreChange = async (storeId: string) => {
    const loadingToast = toast.loading('Alterando empresa...');
    
    try {
      const selectedUserStore = userStores.find(us => us.store._id === storeId);
      if (selectedUserStore) {
        await utils.invalidate();
        await setStore(selectedUserStore.store);
        toast.success('Empresa alterada com sucesso!', {
          id: loadingToast
        });
      }
    } catch (error) {
      console.error('Erro ao trocar de empresa:', error);
      toast.error('Erro ao trocar de empresa. Tente novamente.', {
        id: loadingToast
      });
    }
  };

  const isLoading = isStoreLoading || isLoadingStores;

  if (isLoading) {
    return <Skeleton className="w-[280px] h-10" />;
  }

  if (!userStores || userStores.length === 0) {
    return null;
  }

  const currentUserStore = userStores.find(us => us.store._id === storeId);
  
  // Se não tem store no estado mas tem storeId do cookie, usa os dados do userStores
  const displayStore = store || currentUserStore?.store;
  const displayTitle = displayStore?.title || 'Selecione uma loja';

  return (
    <Select
      value={storeId || ''}
      onValueChange={handleStoreChange}
    >
      <SelectTrigger className="w-[280px]">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 shrink-0 opacity-50" />
          <span className="truncate">{displayTitle}</span>
          {currentUserStore && (
            <Badge variant="secondary" className={cn(
              "font-normal text-xs",
              roleColors[currentUserStore.role]
            )}>
              {roleLabels[currentUserStore.role]}
            </Badge>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {userStores.map(userStore => (
          <SelectItem
            key={userStore.store._id}
            value={userStore.store._id}
            className="py-2"
          >
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">{userStore.store.title}</span>
              <Badge variant="secondary" className={cn(
                "font-normal text-xs",
                roleColors[userStore.role]
              )}>
                {roleLabels[userStore.role]}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 