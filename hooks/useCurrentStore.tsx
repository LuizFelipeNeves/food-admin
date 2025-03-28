'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface Store {
  _id: string;
  title: string;
  email: string;
  phone: string;
}

interface CurrentStoreState {
  store: Store | null;
  isLoading: boolean;
  setStore: (store: Store | null) => void;
  clearStore: () => void;
  getStoreId: () => string;
}

const COOKIE_OPTIONS = {
  expires: 30, // 30 dias
  path: '/',
  sameSite: 'strict' as const
};

const useCurrentStoreState = create<CurrentStoreState>()(
  persist(
    (set, get) => ({
      store: null,
      isLoading: false,
      setStore: (store) => {
        set({ isLoading: true });
        try {
          if (store) {
            Cookies.set('selectedStore', store._id, COOKIE_OPTIONS);
          } else {
            Cookies.remove('selectedStore', COOKIE_OPTIONS);
          }
          set({ store, isLoading: false });
        } catch (error) {
          console.error('Erro ao salvar store:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      clearStore: () => {
        Cookies.remove('selectedStore', COOKIE_OPTIONS);
        set({ store: null, isLoading: false });
      },
      getStoreId: () => {
        return get().store?._id || Cookies.get('selectedStore') || '';
      }
    }),
    {
      name: 'current-store',
      partialize: (state) => ({ store: state.store }),
      skipHydration: true,
    }
  )
);

const useCurrentStore = () => {
  const router = useRouter();
  const pathname = usePathname();
  const store = useCurrentStoreState((state) => state.store);
  const isLoading = useCurrentStoreState((state) => state.isLoading);
  const setStoreOriginal = useCurrentStoreState((state) => state.setStore);
  const clearStore = useCurrentStoreState((state) => state.clearStore);
  const getStoreId = useCurrentStoreState((state) => state.getStoreId);

  // Verifica se o cookie existe mas não tem store no estado
  useEffect(() => {
    const storedId = Cookies.get('selectedStore');
    if (storedId && !store) {
      router.refresh();
    }
  }, [store, router]);

  // Força recarregamento quando a store muda
  useEffect(() => {
    const storedId = Cookies.get('selectedStore');
    if (storedId && store?._id !== storedId) {
      router.refresh();
    }
  }, [store, router]);

  const setStore = async (newStore: Store | null) => {
    try {
      // Primeiro atualiza o estado
      setStoreOriginal(newStore);
      
      if (newStore) {
        // Se estiver em uma rota protegida, força reload
        if (!pathname.includes('/store/select') && !pathname.includes('/store/register')) {
          window.location.href = window.location.href;
        } else {
          router.push('/');
        }
      } else {
        clearStore();
        router.push('/store/select');
      }
    } catch (error) {
      console.error('Erro ao atualizar store:', error);
      throw error;
    }
  };

  return { 
    store, 
    setStore, 
    isLoading, 
    clearStore,
    storeId: getStoreId(),
    selectedStore: store?.title || 'Selecione uma empresa'
  };
};

export default useCurrentStore; 