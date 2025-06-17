
import { Suspense } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import TranslationWrapper from "./components/translation/TranslationWrapper";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <TranslationWrapper skipLoading={true}>
        <Suspense 
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
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
