
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";
import { useAuthStore } from "./hooks/auth/useAuthStore";

// CRITICAL: Initialize auth system immediately
console.log('[Main] Initializing application with immediate auth readiness...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Initialize auth store immediately
const initializeApp = async () => {
  try {
    console.log('[Main] Initializing auth store...');
    await useAuthStore.getState().initializeAuth(false);
    console.log('[Main] Auth store initialized successfully');
  } catch (error) {
    console.error('[Main] Auth initialization error:', error);
  }
};

// Initialize immediately
initializeApp();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
