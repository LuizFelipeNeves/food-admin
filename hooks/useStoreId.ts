'use client';

import useCurrentStore from './useCurrentStore';

// Hook de compatibilidade para migração gradual
export function useStoreId() {
  const { storeId } = useCurrentStore();
  return storeId;
} 