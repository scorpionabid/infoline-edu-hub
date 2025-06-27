// ============================================================================
// İnfoLine Auth System - Enhanced Session Monitoring Hook
// ============================================================================
// Bu hook session status-unu real-time izləmək üçün istifadə olunur

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { getSessionManagerStatus, checkAndRefreshSession } from '@/hooks/auth/sessionManager';

export interface SessionStatus {
  isHealthy: boolean;
  timeUntilExpiry: number | null;
  needsRefresh: boolean;
  hasActiveTimer: boolean;
  retryCount: number;
  lastActivity: Date | null;
  warnings: string[];
}

/**
 * Hook session status-unu monitor etmək üçün
 * @param options Monitoring options
 * @returns Session status information
 */
export const useSessionMonitor = (options: {
  enabled?: boolean;
  checkInterval?: number;
  warningThreshold?: number;
} = {}) => {
  const {
    enabled = true,
    checkInterval = 30000, // 30 seconds
    warningThreshold = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isHealthy: true,
    timeUntilExpiry: null,
    needsRefresh: false,
    hasActiveTimer: false,
    retryCount: 0,
    lastActivity: null,
    warnings: [],
  });

  const authState = useAuthStore();

  /**
   * Calculate current session status
   */
  const calculateSessionStatus = useCallback((): SessionStatus => {
    const warnings: string[] = [];
    const managerStatus = getSessionManagerStatus();
    
    // Calculate time until expiry
    let timeUntilExpiry: number | null = null;
    let needsRefresh = false;
    
    if (authState.session?.expires_at) {
      timeUntilExpiry = (authState.session.expires_at * 1000) - Date.now();
      needsRefresh = timeUntilExpiry < warningThreshold;
      
      if (timeUntilExpiry < warningThreshold) {
        warnings.push(`Session expires in ${Math.round(timeUntilExpiry / 60000)} minutes`);
      }
    }
    
    // Check for stuck loading state
    if (authState.isLoading && authState.loadingStartTime) {
      const loadingDuration = Date.now() - authState.loadingStartTime;
      if (loadingDuration > 30000) {
        warnings.push('Loading state active for over 30 seconds');
      }
    }
    
    // Check for retry attempts
    if (managerStatus.retryCount > 0) {
      warnings.push(`${managerStatus.retryCount} retry attempts in progress`);
    }
    
    // Check for missing refresh timer when needed
    if (needsRefresh && !managerStatus.hasRefreshTimer) {
      warnings.push('Session needs refresh but no timer is active');
    }
    
    // Check for user inactivity
    const timeSinceActivity = managerStatus.timeSinceActivity;
    if (timeSinceActivity > 30 * 60 * 1000) {
      warnings.push(`User inactive for ${Math.round(timeSinceActivity / 60000)} minutes`);
    }
    
    const isHealthy = warnings.length === 0 && !authState.error;
    
    return {
      isHealthy,
      timeUntilExpiry,
      needsRefresh,
      hasActiveTimer: managerStatus.hasRefreshTimer,
      retryCount: managerStatus.retryCount,
      lastActivity: managerStatus.lastActivity,
      warnings,
    };
  }, [authState, warningThreshold]);

  /**
   * Force refresh session
   */
  const forceRefresh = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 [Session Monitor] Forcing session refresh...');
      const session = await checkAndRefreshSession();
      
      if (session) {
        console.log('✅ [Session Monitor] Force refresh successful');
        return true;
      } else {
        console.error('❌ [Session Monitor] Force refresh failed');
        return false;
      }
    } catch (error) {
      console.error('❌ [Session Monitor] Force refresh error:', error);
      return false;
    }
  }, []);

  /**
   * Get detailed session information for debugging
   */
  const getDetailedInfo = useCallback(() => {
    return {
      authState: {
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        initialized: authState.initialized,
        error: authState.error,
      },
      session: authState.session ? {
        expiresAt: new Date(authState.session.expires_at! * 1000),
        userId: authState.session.user?.id,
      } : null,
      manager: getSessionManagerStatus(),
      status: sessionStatus,
    };
  }, [authState, sessionStatus]);

  // Update session status periodically
  useEffect(() => {
    if (!enabled) return;

    const updateStatus = () => {
      const newStatus = calculateSessionStatus();
      setSessionStatus(newStatus);
    };

    // Initial update
    updateStatus();

    // Set up periodic updates
    const interval = setInterval(updateStatus, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, checkInterval, calculateSessionStatus]);

  // Log warnings when they occur
  useEffect(() => {
    if (sessionStatus.warnings.length > 0) {
      console.warn('⚠️ [Session Monitor] Warnings detected:', sessionStatus.warnings);
    }
  }, [sessionStatus.warnings]);

  return {
    status: sessionStatus,
    forceRefresh,
    getDetailedInfo,
    
    // Convenience getters
    isHealthy: sessionStatus.isHealthy,
    warnings: sessionStatus.warnings,
    needsRefresh: sessionStatus.needsRefresh,
    timeUntilExpiry: sessionStatus.timeUntilExpiry,
  };
};

/**
 * Simplified hook for checking if session is healthy
 */
export const useSessionHealth = () => {
  const { isHealthy, warnings } = useSessionMonitor({
    checkInterval: 60000, // Check every minute
  });
  
  return { isHealthy, warnings };
};

/**
 * Hook for session expiry warnings
 */
export const useSessionExpiry = (warningMinutes: number = 5) => {
  const { status } = useSessionMonitor({
    warningThreshold: warningMinutes * 60 * 1000,
  });
  
  const minutesUntilExpiry = status.timeUntilExpiry 
    ? Math.floor(status.timeUntilExpiry / 60000)
    : null;
    
  const showWarning = status.timeUntilExpiry !== null && 
                     status.timeUntilExpiry < (warningMinutes * 60 * 1000);
  
  return {
    showWarning,
    minutesLeft: minutesUntilExpiry,
    needsRefresh: status.needsRefresh,
  };
};
