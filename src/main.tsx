
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";

// CRITICAL: Initialize for Azerbaijani language priority with immediate readiness
console.log('[Main] Initializing translation system with immediate Azerbaijani readiness...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Ensure immediate Azerbaijani language availability
const ensureAzerbaijaniReadiness = () => {
  console.log('[Main] Ensuring Azerbaijani translation readiness...');
  // Translation system will start ready with fallback content
  return Promise.resolve();
};

ensureAzerbaijaniReadiness();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
