// ============================================================================
// İnfoLine Debug Utilities - Session Manager Debug Helper
// ============================================================================
// Bu fayl session manager-in debug edilməsi üçün utility funksiyalarını təmin edir

import { getSessionManagerStatus, forceRefreshSession, __sessionManager, __SESSION_CONFIG } from '@/hooks/auth/sessionManager';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

/**
 * Session debug information
 */
export interface SessionDebugInfo {
  authState: {
    isAuthenticated: boolean;
    isLoading: boolean;
    initialized: boolean;
    hasUser: boolean;
    hasSession: boolean;
    error: string | null;
  };
  sessionManager: {
    hasRefreshTimer: boolean;
    hasBackgroundChecker: boolean;
    retryCount: number;
    lastActivity: Date;
    timeSinceActivity: number;
  };
  session: {
    expiresAt: Date | null;
    timeUntilExpiry: number | null;
    needsRefresh: boolean;
  };
  config: typeof __SESSION_CONFIG;
}

/**
 * Get comprehensive session debug information
 */
export function getSessionDebugInfo(): SessionDebugInfo {
  const authState = useAuthStore.getState();
  const sessionManagerStatus = getSessionManagerStatus();
  
  // Session timing information
  let expiresAt: Date | null = null;
  let timeUntilExpiry: number | null = null;
  let needsRefresh = false;
  
  if (authState.session?.expires_at) {
    expiresAt = new Date(authState.session.expires_at * 1000);
    timeUntilExpiry = (authState.session.expires_at * 1000) - Date.now();
    needsRefresh = timeUntilExpiry < (5 * 60 * 1000); // Less than 5 minutes
  }
  
  return {
    authState: {
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      initialized: authState.initialized,
      hasUser: !!authState.user,
      hasSession: !!authState.session,
      error: authState.error,
    },
    sessionManager: sessionManagerStatus,
    session: {
      expiresAt,
      timeUntilExpiry,
      needsRefresh,
    },
    config: __SESSION_CONFIG,
  };
}

/**
 * Log comprehensive session debug information to console
 */
export function logSessionDebugInfo(): void {
  const debugInfo = getSessionDebugInfo();
  
  console.group('🔍 [Session Debug] Current State');
  
  console.log('📊 Auth State:', debugInfo.authState);
  console.log('⚙️ Session Manager:', debugInfo.sessionManager);
  console.log('⏰ Session Timing:', debugInfo.session);
  console.log('🔧 Configuration:', debugInfo.config);
  
  // Additional helpful information
  if (debugInfo.session.expiresAt) {
    console.log(`📅 Session expires: ${debugInfo.session.expiresAt.toLocaleString()}`);
    
    if (debugInfo.session.timeUntilExpiry) {
      const minutes = Math.floor(debugInfo.session.timeUntilExpiry / 60000);
      const seconds = Math.floor((debugInfo.session.timeUntilExpiry % 60000) / 1000);
      console.log(`⏱️ Time until expiry: ${minutes}m ${seconds}s`);
    }
  }
  
  // Warnings
  if (debugInfo.authState.isLoading && !debugInfo.sessionManager.hasRefreshTimer) {
    console.warn('⚠️ Auth is loading but no refresh timer is active');
  }
  
  if (debugInfo.session.needsRefresh && !debugInfo.sessionManager.hasRefreshTimer) {
    console.warn('⚠️ Session needs refresh but no refresh timer is active');
  }
  
  if (debugInfo.sessionManager.retryCount > 0) {
    console.warn(`⚠️ Session manager has ${debugInfo.sessionManager.retryCount} retry attempts`);
  }
  
  console.groupEnd();
}

/**
 * Force refresh session with debug logging
 */
export async function debugForceRefresh(): Promise<boolean> {
  console.log('🔄 [Session Debug] Forcing session refresh...');
  
  const beforeState = getSessionDebugInfo();
  console.log('📊 State before refresh:', beforeState);
  
  try {
    const newSession = await forceRefreshSession();
    
    const afterState = getSessionDebugInfo();
    console.log('📊 State after refresh:', afterState);
    
    if (newSession) {
      console.log('✅ [Session Debug] Force refresh successful');
      return true;
    } else {
      console.error('❌ [Session Debug] Force refresh failed - no session returned');
      return false;
    }
  } catch (error) {
    console.error('❌ [Session Debug] Force refresh failed with error:', error);
    return false;
  }
}

/**
 * Monitor session status with periodic logging
 */
export function startSessionMonitoring(intervalMs: number = 30000): () => void {
  console.log(`🔍 [Session Debug] Starting session monitoring (every ${intervalMs}ms)`);
  
  const interval = setInterval(() => {
    logSessionDebugInfo();
  }, intervalMs);
  
  // Return cleanup function
  return () => {
    console.log('🛑 [Session Debug] Stopping session monitoring');
    clearInterval(interval);
  };
}

/**
 * Session health check with recommendations
 */
export function performSessionHealthCheck(): {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
} {
  const debugInfo = getSessionDebugInfo();
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for critical issues
  if (!debugInfo.authState.hasSession && debugInfo.authState.isAuthenticated) {
    status = 'critical';
    issues.push('Authenticated user has no session');
    recommendations.push('Force refresh session or re-authenticate user');
  }
  
  if (debugInfo.authState.isLoading && debugInfo.sessionManager.timeSinceActivity > 60000) {
    status = 'critical';
    issues.push('Loading state stuck for over 1 minute');
    recommendations.push('Reset loading state or restart session manager');
  }
  
  // Check for warning issues
  if (debugInfo.session.needsRefresh && !debugInfo.sessionManager.hasRefreshTimer) {
    if (status === 'healthy') status = 'warning';
    issues.push('Session needs refresh but no timer is active');
    recommendations.push('Setup session timeout or force refresh');
  }
  
  if (debugInfo.sessionManager.retryCount >= 2) {
    if (status === 'healthy') status = 'warning';
    issues.push(`High retry count: ${debugInfo.sessionManager.retryCount}`);
    recommendations.push('Check network connectivity and session validity');
  }
  
  if (debugInfo.sessionManager.timeSinceActivity > 30 * 60 * 1000) {
    if (status === 'healthy') status = 'warning';
    issues.push('User inactive for over 30 minutes');
    recommendations.push('Consider showing idle warning or auto-logout');
  }
  
  return { status, issues, recommendations };
}

/**
 * Export session debug info as JSON for sharing
 */
export function exportSessionDebugInfo(): string {
  const debugInfo = getSessionDebugInfo();
  const healthCheck = performSessionHealthCheck();
  
  const exportData = {
    timestamp: new Date().toISOString(),
    debugInfo,
    healthCheck,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Development-only session debugging tools
 * Only available in development environment
 */
export const devSessionTools = {
  log: logSessionDebugInfo,
  forceRefresh: debugForceRefresh,
  monitor: startSessionMonitoring,
  healthCheck: performSessionHealthCheck,
  export: exportSessionDebugInfo,
  
  // Quick access to internal state
  getAuthState: () => useAuthStore.getState(),
  getSessionManager: () => __sessionManager,
  getConfig: () => __SESSION_CONFIG,
};

// Make debug tools available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).sessionDebug = devSessionTools;
  console.log('🔧 [Session Debug] Debug tools available at window.sessionDebug');
}
