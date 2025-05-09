
import React from 'react';
// We don't want to recreate QueryClient - it's already defined in main.tsx
import { useQueryClient } from '@tanstack/react-query';

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

// Re-export for compatibility
export const AppQueryProvider = CacheProvider;
