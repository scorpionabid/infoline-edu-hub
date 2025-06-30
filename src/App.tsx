
import { Suspense, useEffect, useState, useCallback } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import TranslationWrapper from "./components/translation/TranslationWrapper";
import { NotificationProvider } from "./components/notifications/NotificationProvider";
import { useAuthStore } from "./hooks/auth/useAuthStore";
import "./App.css";

// Simple loading fallback
const AppLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-sm text-muted-foreground">İnfoLine yüklənir...</p>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    // Enhanced startup logging
    console.log('🚀 [App] İnfoLine application starting with enhanced auth and notifications...');
    
    // Performance monitoring
    const startTime = performance.now();
    
    // Cleanup function
    return () => {
      const loadTime = performance.now() - startTime;
      console.log(`✅ [App] Application cleanup - ran for ${Math.round(loadTime)}ms`);
    };
  }, []);
  
  // Clear any stale auth data on app startup
  useEffect(() => {
    try {
      // Remove specific cache keys that might interfere with auth
      const authKeysToRemove = [
        'sb-olbfnauhzpdskqnxtwav-auth-token',
        'supabase.auth.token',
        'auth-storage-key'
      ];
      
      authKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      console.log('🧹 [App] Stale auth cache cleared');
    } catch (error) {
      console.warn('⚠️ [App] Could not clear auth cache:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <TranslationWrapper skipLoading={true}>
        <NotificationProvider>
          <Suspense fallback={<AppLoading />}>
            <AppRoutes />
            <Toaster 
              position="top-right" 
              richColors 
              duration={4000}
            />
          </Suspense>
        </NotificationProvider>
      </TranslationWrapper>
    </ErrorBoundary>
  );
}

export default App;
