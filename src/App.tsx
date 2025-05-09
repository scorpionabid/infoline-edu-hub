
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { LanguageProvider } from '@/context/LanguageContext';

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppRoutes />
        <Toaster />
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
