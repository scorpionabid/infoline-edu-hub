
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

function App() {
  // Prevent double initialization by using a flag
  const authInitialized = React.useRef(false);
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  
  // Run once on app startup, but use a ref to prevent repeated calls
  useEffect(() => {
    if (authInitialized.current) return;
    
    console.log('[App] Initializing authentication...');
    authInitialized.current = true;
    initializeAuth();
  }, [initializeAuth]);

  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
