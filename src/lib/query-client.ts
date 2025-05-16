
import { QueryClient } from '@tanstack/react-query';

// Create a QueryClient with enhanced default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// Helper for invalidating related query keys
export const invalidateRelatedQueries = (keys: string[]) => {
  keys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};

// Helper for canceling queries
export const cancelQueries = (keys: string[]) => {
  keys.forEach(key => {
    queryClient.cancelQueries({ queryKey: [key] });
  });
};
