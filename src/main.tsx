
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";

console.log('[Main] Starting InfoLine application...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Production-ready render without StrictMode for better performance
ReactDOM.createRoot(rootElement).render(
  <BrowserRouter>
    <TranslationProvider>
      <App />
    </TranslationProvider>
  </BrowserRouter>
);
