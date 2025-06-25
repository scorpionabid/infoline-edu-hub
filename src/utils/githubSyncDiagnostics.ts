
/**
 * GitHub Sync Diagnostics Utility
 * 
 * Provides diagnostic information about current state to help
 * troubleshoot GitHub webhook sync issues
 */

export interface SyncDiagnosticInfo {
  timestamp: string;
  userAgent: string;
  currentUrl: string;
  localStorage: Record<string, any>;
  sessionStorage: Record<string, any>;
  cacheInfo: {
    hasServiceWorker: boolean;
    cacheStorageSize: number;
  };
  gitInfo: {
    lastCommitInfo?: string;
    branchInfo?: string;
  };
}

export const gatherDiagnosticInfo = async (): Promise<SyncDiagnosticInfo> => {
  const info: SyncDiagnosticInfo = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    currentUrl: window.location.href,
    localStorage: {},
    sessionStorage: {},
    cacheInfo: {
      hasServiceWorker: 'serviceWorker' in navigator,
      cacheStorageSize: 0
    },
    gitInfo: {}
  };

  // Gather localStorage info
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        info.localStorage[key] = localStorage.getItem(key);
      }
    }
  } catch (error) {
    console.warn('Could not access localStorage:', error);
  }

  // Gather sessionStorage info
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        info.sessionStorage[key] = sessionStorage.getItem(key);
      }
    }
  } catch (error) {
    console.warn('Could not access sessionStorage:', error);
  }

  // Check cache storage
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      info.cacheInfo.cacheStorageSize = cacheNames.length;
    } catch (error) {
      console.warn('Could not access cache storage:', error);
    }
  }

  return info;
};

export const logDiagnosticInfo = async () => {
  const info = await gatherDiagnosticInfo();
  console.group('🔍 GitHub Sync Diagnostic Information');
  console.log('Timestamp:', info.timestamp);
  console.log('Current URL:', info.currentUrl);
  console.log('Service Worker Available:', info.cacheInfo.hasServiceWorker);
  console.log('Cache Storage Entries:', info.cacheInfo.cacheStorageSize);
  console.log('LocalStorage Keys:', Object.keys(info.localStorage));
  console.log('SessionStorage Keys:', Object.keys(info.sessionStorage));
  console.groupEnd();
  
  return info;
};

export const exportDiagnosticReport = async (): Promise<string> => {
  const info = await gatherDiagnosticInfo();
  return JSON.stringify(info, null, 2);
};

// Console helper functions
if (typeof window !== 'undefined') {
  (window as any).InfoLineDiagnostics = {
    gather: gatherDiagnosticInfo,
    log: logDiagnosticInfo,
    export: exportDiagnosticReport,
    clearAll: () => {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      console.log('🧹 All caches cleared');
    }
  };
  
  console.log('🛠️ InfoLine Diagnostics available:');
  console.log('- InfoLineDiagnostics.log() - Log current diagnostic info');
  console.log('- InfoLineDiagnostics.export() - Export diagnostic report');
  console.log('- InfoLineDiagnostics.clearAll() - Clear all caches');
}
