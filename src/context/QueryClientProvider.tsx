
import React from 'react';
import { QueryClientProvider as TanstackQueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { queryClient as defaultQueryClient } from '@/lib/query-client';

// Cache context for management
interface CacheContextType {
  invalidateCache: (queryKey: string[]) => void;
  clearAllCaches: () => void;
}

const defaultCacheContext: CacheContextType = {
  invalidateCache: () => {},
  clearAllCaches: () => {},
};

const CacheContext = React.createContext<CacheContextType>(defaultCacheContext);

// Custom hook
export const useCache = () => React.useContext(CacheContext);

// React Query Client Provider with cache management
export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the queryClient from the parent QueryClientProvider
  // This will work now because we've added QueryClientProvider in main.tsx
  const queryClient = useQueryClient();

  // Cache management functions
  const invalidateCache = (queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  };

  const clearAllCaches = () => {
    queryClient.clear();
  };

  return (
    <CacheContext.Provider value={{ invalidateCache, clearAllCaches }}>
      {children}
    </CacheContext.Provider>
  );
};

// Wrapper component to provide both query client and cache management
export const AppQueryProvider: React.FC<{ children: React.ReactNode; queryClient?: typeof defaultQueryClient }> = ({ 
  children,
  queryClient = defaultQueryClient 
}) => {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      <CacheProvider>{children}</CacheProvider>
    </TanstackQueryClientProvider>
  );
};
