// DEBUG: Auth store state monitor
console.log('[AuthStore Debug] Creating debug monitor...');

// Monitor auth state changes in real-time
const debugAuthStore = () => {
  const store = useAuthStore.getState();
  console.log('[AuthStore Debug] Current state:', {
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    user: store.user ? { id: store.user.id, role: store.user.role } : null,
    error: store.error,
    initialized: store.initialized
  });
};

// Call debug every 2 seconds during login process
let debugInterval: NodeJS.Timeout | null = null;

const startDebugMonitoring = () => {
  if (debugInterval) clearInterval(debugInterval);
  debugInterval = setInterval(debugAuthStore, 2000);
  console.log('[AuthStore Debug] Started monitoring...');
};

const stopDebugMonitoring = () => {
  if (debugInterval) {
    clearInterval(debugInterval);
    debugInterval = null;
    console.log('[AuthStore Debug] Stopped monitoring');
  }
};

// Start monitoring on page load
if (typeof window !== 'undefined') {
  startDebugMonitoring();
  
  // Stop after 30 seconds
  setTimeout(stopDebugMonitoring, 30000);
}

export { startDebugMonitoring, stopDebugMonitoring };
