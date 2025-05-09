
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/components/ui/theme-provider';

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="infoline-ui-theme">
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
