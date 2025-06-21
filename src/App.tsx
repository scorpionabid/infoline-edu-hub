
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import AppRoutes from '@/routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    console.log('[App] Initializing auth on app mount');
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TranslationProvider>
          <NotificationProvider userId={user?.id}>
            <div className="min-h-screen bg-background">
              <AppRoutes />
              <Toaster position="top-right" />
            </div>
          </NotificationProvider>
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
