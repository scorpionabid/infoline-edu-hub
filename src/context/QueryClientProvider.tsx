
import React, { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';
import { invalidateCache, clearAllCaches } from '@/hooks/useCachedQuery';

// Keş idarəsi üçün kontekst yaradaq
interface CacheContextType {
  invalidateQueries: (key: string | string[]) => void;
  clearCache: () => void;
}

const CacheContext = createContext<CacheContextType>({
  invalidateQueries: () => {},
  clearCache: () => {}
});

export const useCacheInvalidation = () => useContext(CacheContext);

export const AppQueryClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 dəqiqə
        cacheTime: 10 * 60 * 1000, // 10 dəqiqə
      },
    },
  }));

  // Keş invalidasiya funksiyaları
  const cacheContext = React.useMemo(() => ({
    invalidateQueries: (key: string | string[]) => {
      if (Array.isArray(key)) {
        key.forEach(k => invalidateCache(k));
      } else {
        invalidateCache(key);
      }
      queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
    },
    clearCache: () => {
      clearAllCaches();
      queryClient.clear();
    }
  }), [queryClient]);

  return (
    <CacheContext.Provider value={cacheContext}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </CacheContext.Provider>
  );
};
