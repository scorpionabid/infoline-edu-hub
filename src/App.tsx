
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/context/LanguageContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { CacheHelpers } from '@/services/reports/cacheService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
    
    // Initialize cache system
    CacheHelpers.setupAutoCleanup(60000); // Cleanup every minute
    
    // Preload common data after a short delay
    setTimeout(() => {
      CacheHelpers.preloadCommonData().catch(console.error);
    }, 2000);
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppRoutes />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
