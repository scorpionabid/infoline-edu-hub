
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import logger from './lib/logger';

function App() {
  // Prevent double initialization by using a flag
  const authInitialized = React.useRef(false);
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  
  // Run once on app startup, but use a ref to prevent repeated calls
  useEffect(() => {
    if (authInitialized.current) return;
    
    logger.info('Initializing application', { context: 'App' });
    authInitialized.current = true;
    
    // Initialize auth immediately to avoid any timing issues
    logger.info('Initializing authentication', { context: 'App' });
    initializeAuth().catch(error => {
      logger.error('Failed to initialize authentication', error, { context: 'App' });
    });
  }, [initializeAuth]);

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
