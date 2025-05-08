
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useRoutes } from 'react-router-dom';
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
