
import { Suspense } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
