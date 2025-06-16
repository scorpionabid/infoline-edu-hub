import React, { useEffect } from 'react';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { CacheHelpers } from '@/services/reports/cacheService';
import TranslationDevPanel from '@/components/dev/TranslationDevPanel';

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
    
    // Initialize cache system
    CacheHelpers.setupAutoCleanup(60000); // Cleanup every minute
    
    // Preload common data after a short delay
    setTimeout(() => {
      CacheHelpers.preloadCommonData().catch(console.error);
    }, 2000);
  }, [initializeAuth]);

  return (
    <>
      <AppRoutes />
      
      {/* Development Translation Panel */}
      <TranslationDevPanel 
        enabled={process.env.NODE_ENV === 'development'}
        position="bottom-right"
      />
    </>
  );
}

export default App;