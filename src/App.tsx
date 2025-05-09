
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/context/QueryClientProvider';

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="infoline-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <AppRoutes />
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
