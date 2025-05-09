
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { NotificationProvider } from '@/context/NotificationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/auth';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { RegisterSW } from './lib/register-sw';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { CacheProvider } from '@/context/QueryClientProvider';

function App() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      try {
        // Register service worker if available
        RegisterSW();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              <CacheProvider>
                <AppRoutes />
                <Toaster />
              </CacheProvider>
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
