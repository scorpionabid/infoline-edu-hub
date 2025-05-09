
import React, { useEffect, memo } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { NotificationProvider } from '@/context/NotificationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/auth';
import { CacheProvider } from '@/context/QueryClientProvider';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from './routes/AppRoutes';
import { RegisterSW } from './lib/register-sw';

/**
 * Main App component with properly ordered providers.
 * Provider order is important for authentication and state management:
 * ThemeProvider -> AuthProvider -> LanguageProvider -> NotificationProvider -> CacheProvider
 */
const App: React.FC = () => {
  useEffect(() => {
    // Register service worker only once on mount
    const registerServiceWorker = async () => {
      try {
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
            <CacheProvider>
              <AppRoutes />
              <Toaster />
            </CacheProvider>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Memoize App component to prevent unnecessary re-renders
export default memo(App);
