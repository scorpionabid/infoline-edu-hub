
import { Suspense, useEffect } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import TranslationWrapper from "./components/translation/TranslationWrapper";
import "./App.css";
import "./styles/enhanced-data-entry.css";

// Simple loading fallback
const AppLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-sm text-muted-foreground">İnfoLine yüklənir...</p>
      <p className="text-xs text-muted-foreground">Cache təmizləndi, yeni data yüklənir</p>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    // Force fresh data loading
    console.log('🔄 App component mounted - forcing fresh data load');
    
    // Clear any remaining stale data
    try {
      // Remove specific cache keys that might contain old data
      const keysToRemove = [
        'last-route',
        'user-preferences',
        'dashboard-state',
        'translation-state'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Could not clear stale data keys:', error);
    }

    // Log current timestamp for debugging
    console.log(`App loaded at: ${new Date().toISOString()}`);
  }, []);

  return (
    <ErrorBoundary>
      <TranslationWrapper skipLoading={true}>
        <Suspense fallback={<AppLoading />}>
          <AppRoutes />
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            duration={4000}
          />
        </Suspense>
      </TranslationWrapper>
    </ErrorBoundary>
  );
}

export default App;
