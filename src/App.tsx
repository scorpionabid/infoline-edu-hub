
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/auth/AuthProvider';

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
};

export default App;
