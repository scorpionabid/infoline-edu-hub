
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

function App() {
  // Prevent double initialization by using a flag
  const authInitialized = React.useRef(false);
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  
  // Run once on app startup, but use a ref to prevent repeated calls
  useEffect(() => {
    if (authInitialized.current) return;
    
    console.info('Initializing application', { context: 'App' });
    authInitialized.current = true;
    
    // Initialize auth immediately to avoid any timing issues
    console.info('Initializing authentication', { context: 'App' });
    initializeAuth().catch(error => {
      console.error('Failed to initialize authentication', error, { context: 'App' });
    });
  }, [initializeAuth]);

  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );
}

export default App;
