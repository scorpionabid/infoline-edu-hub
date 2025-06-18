
import { Suspense } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import TranslationWrapper from "./components/translation/TranslationWrapper";
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
