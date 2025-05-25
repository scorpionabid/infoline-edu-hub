
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

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
  }, [initializeAuth]);

  // 10 saniyə sonra yüklənmə vəziyyətini dayandır ki, istifadəçi sonsuz yüklənmədə qalmasın
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (useAuthStore.getState().isLoading) {
        console.log('Auth loading timeout triggered');
        useAuthStore.setState({ 
          isLoading: false,
          error: 'Authentication timed out. Please refresh and try again.'
        });
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
