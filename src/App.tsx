
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { AppRoutes } from '@/routes/AppRoutes';

function App() {
  const { refreshSession } = useAuthStore();
  
  // Run once on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[App] Initializing authentication...');
      await refreshSession();
    };
    
    initializeAuth();
  }, [refreshSession]);

  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );
}

export default App;
