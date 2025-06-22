
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppQueryProvider } from "./contexts/QueryClientProvider";
import { performFullCacheReset } from "./utils/cleanupUtils";

console.log('[Main] Starting InfoLine application with COMPLETE cache reset...');

// Force complete cache reset on startup
const shouldResetCache = sessionStorage.getItem('cache-reset-done') !== 'true';

if (shouldResetCache) {
  console.log('🧹 Performing startup cache reset...');
  
  // Clear all storage types
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    // Mark that we've done the reset to avoid infinite loops
    sessionStorage.setItem('cache-reset-done', 'true');
    
    console.log('✅ Startup cache reset completed');
  } catch (error) {
    console.warn('⚠️ Startup cache reset failed:', error);
  }
}

// Load cleanup utils for console debugging
import("./utils/cleanupUtils").then(() => {
  console.log('🛠️ Cache cleanup tools loaded. Use InfoLineDebug in console.');
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Add timestamp to force reload detection
const startTime = Date.now();
console.log(`🚀 InfoLine starting at ${new Date(startTime).toLocaleString()}`);

// Production-ready render without StrictMode for better performance
ReactDOM.createRoot(rootElement).render(
  <BrowserRouter>
    <ThemeProvider>
      <AppQueryProvider>
        <TranslationProvider>
          <App />
        </TranslationProvider>
      </AppQueryProvider>
    </ThemeProvider>
  </BrowserRouter>
);

// Log completion
console.log('✅ InfoLine application rendered successfully');
