
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";
import { AppQueryProvider } from "./contexts/QueryClientProvider";
import "./utils/cleanupUtils";

console.log('[Main] Starting InfoLine application...');
console.log('🛠️ Cache cleanup tools loaded. Use InfoLineDebug in console.');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Production-ready render without StrictMode for better performance
ReactDOM.createRoot(rootElement).render(
  <BrowserRouter>
    <AppQueryProvider>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </AppQueryProvider>
  </BrowserRouter>
);
