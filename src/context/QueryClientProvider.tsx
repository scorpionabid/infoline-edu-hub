
import React, { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';
import { createCacheInvalidator } from '@/hooks/useCachedQuery';

// Keş idarəsi üçün kontekst yaradaq
type CacheContextType = {
  invalidateQuery: (queryKey: QueryKey) => void;
  invalidateAll: () => void;
};

const CacheContext = createContext<CacheContextType | null>(null);

export function useCacheInvalidation() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCacheInvalidation hook Context Provider olmadan istifadə edilib');
  }
  return context;
}

interface AppQueryProviderProps {
  children: React.ReactNode;
}

export function AppQueryProvider({ children }: AppQueryProviderProps) {
  // React Query Client yaradaq
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        retryDelay: 1000,
        staleTime: 1000 * 60 * 5, // 5 dəqiqə
        gcTime: 1000 * 60 * 30, // 30 dəqiqə (əvvəlki cacheTime əvəzinə)
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    },
  });
  
  // Keş invalidasiyası üçün utilit yaradaq
  const cacheInvalidator = createCacheInvalidator(queryClient);
  
  return (
    <QueryClientProvider client={queryClient}>
      <CacheContext.Provider value={cacheInvalidator}>
        {children}
      </CacheContext.Provider>
    </QueryClientProvider>
  );
}
