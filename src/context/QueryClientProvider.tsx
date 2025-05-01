import React, { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Keş idarəsi üçün kontekst yaradaq
interface CacheContextType {
  invalidateCache: (queryKey: string[]) => void;
  clearAllCaches: () => void;
}

const defaultCacheContext: CacheContextType = {
  invalidateCache: () => {},
  clearAllCaches: () => {},
};

const CacheContext = createContext<CacheContextType>(defaultCacheContext);

// Custom hook
export const useCache = () => useContext(CacheContext);

// React Query Client Provider-i ilə birlikdə keş idarəsini təmin edən komponent
export const CustomQueryClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 dəqiqə
        retry: 1,
      },
    },
  });

  // Keş idarəsi üçün funksiyalar
  const invalidateCache = (queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  };

  const clearAllCaches = () => {
    queryClient.clear();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CacheContext.Provider value={{ invalidateCache, clearAllCaches }}>
        {children}
      </CacheContext.Provider>
    </QueryClientProvider>
  );
};

// AppQueryProvider adını CustomQueryClientProvider üçün alias kimi export edirik
export const AppQueryProvider = CustomQueryClientProvider;
