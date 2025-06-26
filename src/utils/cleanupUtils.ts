
/**
 * Utility functions for cleaning up cached/stale data
 * Enhanced for complete cache reset
 */

export const clearBrowserCache = () => {
  // Clear localStorage
  try {
    localStorage.clear();
    console.log('✅ LocalStorage cleared');
  } catch (error) {
    console.warn('⚠️ Could not clear localStorage:', error);
  }

  // Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('✅ SessionStorage cleared');
  } catch (error) {
    console.warn('⚠️ Could not clear sessionStorage:', error);
  }

  // Clear all cache-related IndexedDB
  try {
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('keyval-store');
      indexedDB.deleteDatabase('cache-db');
      indexedDB.deleteDatabase('translation-cache');
      console.log('✅ IndexedDB caches cleared');
    }
  } catch (error) {
    console.warn('⚠️ Could not clear IndexedDB:', error);
  }
};

export const clearSupabaseCache = () => {
  // Clear any Supabase-related cache keys
  const keysToRemove = [
    'supabase.auth.token',
    'sb-olbfnauhzpdskqnxtwav-auth-token',
    'dashboard-cache',
    'user-cache',
    'school-cache',
    'region-cache',
    'sector-cache',
    'translation-cache',
    'query-cache',
    'route-cache'
  ];

  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`⚠️ Could not remove ${key}:`, error);
    }
  });

  console.log('✅ Supabase cache keys cleared');
};

export const clearServiceWorkerCache = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('✅ Service workers unregistered');
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
      }
      console.log('✅ Browser caches deleted');
    }
  } catch (error) {
    console.warn('⚠️ Could not clear service worker cache:', error);
  }
};

export const clearReactQueryCache = () => {
  // This will be handled by QueryClient invalidation
  console.log('✅ React Query cache will be invalidated');
};

export const performFullCacheReset = async () => {
  console.log('🧹 Starting COMPLETE cache reset...');
  
  clearBrowserCache();
  clearSupabaseCache();
  await clearServiceWorkerCache();
  clearReactQueryCache();
  
  // Clear any remaining cache managers
  try {
    if (window.cacheManager) {
      window.cacheManager.clear();
      console.log('✅ Cache manager cleared');
    }
  } catch (error) {
    console.warn('⚠️ Cache manager not available:', error);
  }

  console.log('✅ COMPLETE cache reset finished');
  console.log('🔄 Force reloading page to apply changes...');
  
  // Force a hard reload
  window.location.reload();
};

// Development helper to identify stale data sources
export const debugDataSources = () => {
  console.group('🔍 Data Sources Debug');
  
  // Check localStorage
  console.log('📦 LocalStorage keys:', Object.keys(localStorage));
  
  // Check sessionStorage  
  console.log('📦 SessionStorage keys:', Object.keys(sessionStorage));
  
  // Check for specific dashboard data
  const dashboardKeys = Object.keys(localStorage).filter(key => 
    key.includes('dashboard') || 
    key.includes('user') || 
    key.includes('school') ||
    key.includes('cache') ||
    key.includes('translation')
  );
  
  console.log('📊 Dashboard-related cache keys:', dashboardKeys);
  
  dashboardKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`🔑 ${key}:`, JSON.parse(value));
      }
    } catch (error) {
      console.log(`🔑 ${key}:`, localStorage.getItem(key));
    }
  });
  
  console.groupEnd();
};

// Console commands for manual debugging
if (typeof window !== 'undefined') {
  (window as any).InfoLineDebug = {
    clearCache: performFullCacheReset,
    debugSources: debugDataSources,
    clearBrowser: clearBrowserCache,
    clearSupabase: clearSupabaseCache,
    clearServiceWorker: clearServiceWorkerCache,
    forceReload: () => {
      console.log('🔄 Force reloading application...');
      window.location.reload();
    }
  };
  
  console.log('🛠️ InfoLine Debug tools available:');
  console.log('- InfoLineDebug.clearCache() - Complete cache reset');
  console.log('- InfoLineDebug.debugSources() - Debug data sources');
  console.log('- InfoLineDebug.clearBrowser() - Clear browser storage');
  console.log('- InfoLineDebug.clearSupabase() - Clear Supabase cache');
  console.log('- InfoLineDebug.clearServiceWorker() - Clear service worker cache');
  console.log('- InfoLineDebug.forceReload() - Force reload page');
}
