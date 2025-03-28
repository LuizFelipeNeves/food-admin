'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface Store {
  _id: string;
  title: string;
  email: string;
  phone: string;
}

interface CurrentStoreState {
  store: Store | null;
  setStore: (store: Store | null) => void;
}

const useCurrentStore = create<CurrentStoreState>()(
  persist(
    (set) => ({
      store: null,
      setStore: (store) => {
        if (store) {
          Cookies.set('selectedStore', store._id, { expires: 30 }); // 30 dias
        } else {
          Cookies.remove('selectedStore');
        }
        set({ store });
      },
    }),
    {
      name: 'current-store',
    }
  )
);

export default useCurrentStore; 