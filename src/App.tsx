
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppQueryProvider } from '@/context/QueryClientProvider';
import { useRoutes } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';

const App = () => {
  return (
    <AppQueryProvider>
      <AppRoutes />
      <Toaster />
    </AppQueryProvider>
  );
};

export default App;
