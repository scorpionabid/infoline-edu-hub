
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";

// CRITICAL: Initialize for Azerbaijani language priority
console.log('[Main] Initializing translation system with Azerbaijani priority...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Preload Azerbaijani translations
const preloadAzerbaijaniTranslations = async () => {
  try {
    console.log('[Main] Preloading Azerbaijani translations...');
    // This will be handled by TranslationProvider
  } catch (error) {
    console.error('[Main] Failed to preload translations:', error);
  }
};

preloadAzerbaijaniTranslations();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
