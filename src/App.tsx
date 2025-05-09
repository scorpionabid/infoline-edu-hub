
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { NotificationProvider } from '@/context/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="infoline-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              <AppRoutes />
              <Toaster />
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
