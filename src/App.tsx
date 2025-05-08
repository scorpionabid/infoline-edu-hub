
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from '@/routes/AppRoutes';

const App = () => {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
};

export default App;
