
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { NotificationProvider } from '@/context/NotificationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/auth';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { RegisterSW } from './lib/register-sw';

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
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toaster />
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
