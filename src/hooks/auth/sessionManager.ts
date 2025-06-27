// ============================================================================
// İnfoLine Auth System - Enhanced Session Manager
// ============================================================================
// Bu fayl session idarəetməsi, token təzələnməsi və timeout funksiyalarını təmin edir
// Enhanced version with proactive refresh, retry logic, and activity detection

import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

// Enhanced session configuration
const SESSION_CONFIG = {
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  BACKGROUND_CHECK_INTERVAL: 2 * 60 * 1000, // Check every 2 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // Base retry delay (exponential backoff)
  IDLE_THRESHOLD: 30 * 60 * 1000, // 30 minutes idle threshold
  MIN_REFRESH_TIME: 60000, // Minimum 1 minute before refresh
  LOADING_TIMEOUT: 30000, // 30 seconds loading timeout
} as const;

/**
 * Enhanced Session Manager Class
 * Handles proactive token refresh, retry logic, cross-tab sync, and activity detection
 */
class EnhancedSessionManager {
  private refreshTimer: number | null = null;
  private backgroundChecker: number | null = null;
  private retryCount = 0;
  private lastActivity = Date.now();
  private storageListener: ((e: StorageEvent) => void) | null = null;
  
  // Activity events for idle detection
  private readonly activityEvents = [
    'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
  ] as const;

  /**
   * Setup comprehensive session management
   * @param session Current auth session
   */
  setupSession(session: Session): void {
    this.clearAllTimers();
    this.setupProactiveRefresh(session);
    this.setupBackgroundChecker();
    this.setupActivityDetection();
    this.setupCrossTabSync();
    
    console.log('✅ [Session] Enhanced session management initialized', {
      expiresAt: new Date((session.expires_at || 0) * 1000).toLocaleString(),
      refreshIn: Math.round(this.calculateRefreshTime(session) / 60000)
    });
  }

  /**
   * Calculate optimal refresh time
   * @param session Current session
   * @returns Milliseconds until refresh should occur
   */
  private calculateRefreshTime(session: Session): number {
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    
    // Refresh 5 minutes before expiry, but at least 1 minute from now
    const timeUntilRefresh = Math.max(
      (expiresAt - now) * 1000 - SESSION_CONFIG.REFRESH_THRESHOLD,
      SESSION_CONFIG.MIN_REFRESH_TIME
    );
    
    // Ensure we don't refresh more than 12 hours from now (safety net)
    return Math.min(timeUntilRefresh, 12 * 60 * 60 * 1000);
  }

  /**
   * Setup proactive token refresh - refreshes before expiry
   * @param session Current session
   */
  private setupProactiveRefresh(session: Session): void {
    const timeUntilRefresh = this.calculateRefreshTime(session);
    
    console.log(`⏰ [Session] Next proactive refresh in ${Math.round(timeUntilRefresh / 60000)} minutes`);
    
    this.refreshTimer = window.setTimeout(async () => {
      await this.performProactiveRefresh();
    }, timeUntilRefresh);
  }

  /**
   * Setup background session health checker
   */
  private setupBackgroundChecker(): void {
    this.backgroundChecker = window.setInterval(async () => {
      await this.performBackgroundCheck();
    }, SESSION_CONFIG.BACKGROUND_CHECK_INTERVAL);
  }

  /**
   * Perform proactive refresh with retry logic
   */
  private async performProactiveRefresh(): Promise<void> {
    try {
      console.log('🔄 [Session] Starting proactive refresh...');
      
      // Check if we're already in a loading state to prevent conflicts
      const authState = useAuthStore.getState();
      if (authState.isLoading) {
        console.log('⚠️ [Session] Skipping refresh - auth operation in progress');
        return;
      }
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        console.log('✅ [Session] Proactive refresh successful');
        
        // Update auth store with new session
        useAuthStore.setState({ 
          session: data.session,
          error: null // Clear any previous errors
        });
        
        // Setup next refresh cycle
        this.setupProactiveRefresh(data.session);
        this.retryCount = 0; // Reset retry count on success
      } else {
        throw new Error('No session returned from refresh');
      }
    } catch (error) {
      console.error('❌ [Session] Proactive refresh failed:', error);
      await this.handleRefreshFailure(error as Error);
    }
  }

  /**
   * Handle refresh failures with intelligent retry logic
   * @param error The error that occurred during refresh
   */
  private async handleRefreshFailure(error: Error): Promise<void> {
    if (this.retryCount < SESSION_CONFIG.MAX_RETRY_ATTEMPTS) {
      this.retryCount++;
      const delay = SESSION_CONFIG.RETRY_DELAY * Math.pow(2, this.retryCount - 1); // Exponential backoff
      
      console.log(`🔄 [Session] Retrying refresh in ${delay}ms (attempt ${this.retryCount}/${SESSION_CONFIG.MAX_RETRY_ATTEMPTS})`);
      
      setTimeout(async () => {
        await this.performProactiveRefresh();
      }, delay);
    } else {
      console.error('❌ [Session] Max retry attempts reached - session may be invalid');
      this.handleSessionFailure(error);
    }
  }

  /**
   * Background health check for session and app state
   */
  private async performBackgroundCheck(): Promise<void> {
    try {
      // Check for stuck loading state
      const authState = useAuthStore.getState();
      
      if (authState.isLoading && authState.loadingStartTime) {
        const loadingDuration = Date.now() - authState.loadingStartTime;
        
        if (loadingDuration > SESSION_CONFIG.LOADING_TIMEOUT) {
          console.warn('⚠️ [Session] Detected stuck loading state, resetting...');
          useAuthStore.setState({ 
            isLoading: false,
            loadingStartTime: null,
            error: 'Yükləmə vaxtı bitdi. Zəhmət olmasa səhifəni yeniləyin.'
          });
        }
      }
      
      // Verify session is still valid
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('⚠️ [Session] Background session check failed:', error);
        return;
      }
      
      if (session) {
        // Check if we need to refresh soon
        const expiresAt = session.expires_at || 0;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = (expiresAt - now) * 1000;
        
        // If less than 10 minutes until expiry and no active refresh timer
        if (timeUntilExpiry < SESSION_CONFIG.REFRESH_THRESHOLD * 2 && !this.refreshTimer) {
          console.log('🔄 [Session] Session expiring soon, triggering immediate refresh');
          this.clearRefreshTimer(); // Clear any existing timer
          await this.performProactiveRefresh();
        }
      } else {
        // No session found in background check
        console.warn('⚠️ [Session] No session found in background check');
        const currentState = useAuthStore.getState();
        if (currentState.isAuthenticated) {
          console.log('🔄 [Session] Clearing authenticated state due to missing session');
          this.handleSessionFailure(new Error('Session not found'));
        }
      }
    } catch (error) {
      console.error('❌ [Session] Background check error:', error);
    }
  }

  /**
   * Setup activity detection for idle management
   */
  private setupActivityDetection(): void {
    const handleActivity = () => {
      this.lastActivity = Date.now();
    };
    
    // Add activity listeners
    this.activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    // Check for idle users periodically
    const idleChecker = setInterval(() => {
      this.checkIdleStatus();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Store idle checker reference for cleanup
    (this as any).idleChecker = idleChecker;
  }

  /**
   * Check if user is idle and take appropriate actions
   */
  private checkIdleStatus(): void {
    const idleDuration = Date.now() - this.lastActivity;
    
    if (idleDuration > SESSION_CONFIG.IDLE_THRESHOLD) {
      const idleMinutes = Math.round(idleDuration / 60000);
      console.log(`⚠️ [Session] User has been idle for ${idleMinutes} minutes`);
      
      // Could implement idle warning modal here in the future
      // For now, just log the idle state
      
      // If idle for more than 1 hour, consider showing warning
      if (idleDuration > 60 * 60 * 1000) {
        console.warn('⚠️ [Session] User idle for over 1 hour - consider session timeout warning');
      }
    }
  }

  /**
   * Setup cross-tab synchronization
   */
  private setupCrossTabSync(): void {
    this.storageListener = async (e: StorageEvent) => {
      // Listen for Supabase auth token changes
      if (e.key?.includes('supabase.auth.token') || e.key?.includes('supabase-auth-token')) {
        console.log('🔄 [Session] Cross-tab token change detected');
        
        try {
          // Get the updated session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ [Session] Error getting session after cross-tab change:', error);
            return;
          }
          
          if (session) {
            // Update our state and setup new refresh cycle
            useAuthStore.setState({ session });
            this.setupProactiveRefresh(session);
            console.log('✅ [Session] Cross-tab session synchronized');
          } else {
            // Session was cleared in another tab
            console.log('🔓 [Session] Session cleared in another tab');
            this.handleSessionFailure(new Error('Session cleared in another tab'));
          }
        } catch (error) {
          console.error('❌ [Session] Cross-tab sync error:', error);
        }
      }
    };
    
    window.addEventListener('storage', this.storageListener);
  }

  /**
   * Handle complete session failure
   * @param error The error that caused the session failure
   */
  private handleSessionFailure(error: Error): void {
    console.error('❌ [Session] Session failure:', error.message);
    
    // Clear all timers and listeners
    this.clearAllTimers();
    
    // Update auth state
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Sessiya vaxtı bitib. Zəhmət olmasa yenidən daxil olun.',
      initialized: true
    });
  }

  /**
   * Clear refresh timer specifically
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Clear all timers and listeners
   */
  clearAllTimers(): void {
    // Clear refresh timer
    this.clearRefreshTimer();
    
    // Clear background checker
    if (this.backgroundChecker) {
      clearInterval(this.backgroundChecker);
      this.backgroundChecker = null;
    }
    
    // Clear idle checker
    if ((this as any).idleChecker) {
      clearInterval((this as any).idleChecker);
      (this as any).idleChecker = null;
    }
    
    // Remove storage listener
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
    
    // Remove activity listeners
    const handleActivity = () => {}; // dummy function for removeEventListener
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, handleActivity);
    });
    
    // Reset retry count
    this.retryCount = 0;
    
    console.log('🧹 [Session] All timers and listeners cleared');
  }

  /**
   * Get current session status for debugging
   */
  getSessionStatus(): {
    hasRefreshTimer: boolean;
    hasBackgroundChecker: boolean;
    retryCount: number;
    lastActivity: Date;
    timeSinceActivity: number;
  } {
    return {
      hasRefreshTimer: this.refreshTimer !== null,
      hasBackgroundChecker: this.backgroundChecker !== null,
      retryCount: this.retryCount,
      lastActivity: new Date(this.lastActivity),
      timeSinceActivity: Date.now() - this.lastActivity
    };
  }
}

// Singleton instance
const sessionManager = new EnhancedSessionManager();

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Setup session timeout and management
 * @param session Current auth session
 */
export function setupSessionTimeout(session: Session): void {
  sessionManager.setupSession(session);
}

/**
 * Clear all session timeouts and listeners
 */
export function clearSessionTimeout(): void {
  sessionManager.clearAllTimers();
}

/**
 * Check current session and refresh if needed
 * @returns Promise resolving to refreshed session or null
 */
export async function checkAndRefreshSession(): Promise<Session | null> {
  try {
    console.log('🔍 [Session] Checking session status...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [Session] Error getting session:', error);
      return null;
    }
    
    if (!session) {
      console.log('ℹ️ [Session] No active session found');
      return null;
    }
    
    // Check if session needs refreshing (expires in less than 10 minutes)
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < 600) { // Less than 10 minutes
      console.log('🔄 [Session] Session expires soon, refreshing now');
      
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('❌ [Session] Session refresh failed:', refreshError);
        return null;
      }
      
      if (data.session) {
        console.log('✅ [Session] Session refreshed successfully');
        return data.session;
      }
    }
    
    return session;
  } catch (error) {
    console.error('❌ [Session] Check and refresh failed:', error);
    return null;
  }
}

/**
 * Force refresh current session
 * @returns Promise resolving to refreshed session or null
 */
export async function forceRefreshSession(): Promise<Session | null> {
  try {
    console.log('🔄 [Session] Forcing session refresh...');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ [Session] Force refresh failed:', error);
      return null;
    }
    
    if (data.session) {
      console.log('✅ [Session] Force refresh successful');
      
      // Update auth store
      useAuthStore.setState({ session: data.session });
      
      // Setup new refresh cycle
      sessionManager.setupSession(data.session);
      
      return data.session;
    }
    
    return null;
  } catch (error) {
    console.error('❌ [Session] Force refresh exception:', error);
    return null;
  }
}

/**
 * Get current session manager status (for debugging)
 */
export function getSessionManagerStatus() {
  return sessionManager.getSessionStatus();
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use setupSessionTimeout instead
 */
export function setupSession(session: Session): void {
  console.warn('⚠️ [Session] setupSession is deprecated, use setupSessionTimeout instead');
  setupSessionTimeout(session);
}

// ============================================================================
// Export for debugging and testing
// ============================================================================

export { sessionManager as __sessionManager };
export { SESSION_CONFIG as __SESSION_CONFIG };
