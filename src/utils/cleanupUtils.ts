/**
 * Utility functions for cleaning up cached/stale data
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
    'sector-cache'
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

export const clearReactQueryCache = () => {
  // This will be handled by QueryClient invalidation
  console.log('✅ React Query cache will be invalidated');
};

export const performFullCacheReset = () => {
  console.log('🧹 Starting full cache reset...');
  
  clearBrowserCache();
  clearSupabaseCache();
  clearReactQueryCache();
  
  console.log('✅ Full cache reset completed');
  console.log('🔄 Please refresh the page to see clean data');
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
    key.includes('cache')
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
    clearSupabase: clearSupabaseCache
  };
  
  console.log('🛠️ InfoLine Debug tools available:');
  console.log('- InfoLineDebug.clearCache() - Full cache reset');
  console.log('- InfoLineDebug.debugSources() - Debug data sources');
  console.log('- InfoLineDebug.clearBrowser() - Clear browser storage');
  console.log('- InfoLineDebug.clearSupabase() - Clear Supabase cache');
}
