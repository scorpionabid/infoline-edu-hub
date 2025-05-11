
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAuth2 } from '@/hooks/auth/useAuth2';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/auth/AuthProvider';

function App() {
  const { refreshSession } = useAuth2();
  
  // Run once on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[App] Initializing authentication...');
      await refreshSession();
    };
    
    initializeAuth();
  }, [refreshSession]);

  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
