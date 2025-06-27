
// ============================================================================
// İnfoLine Auth System - Session Manager (Stabilized)
// ============================================================================
// Bu fayl session idarəetməsi, token təzələnməsi və timeout funksiyalarını təmin edir

import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

// Simplified session configuration
const SESSION_CONFIG = {
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  BACKGROUND_CHECK_INTERVAL: 5 * 60 * 1000, // Check every 5 minutes
  MAX_RETRY_ATTEMPTS: 2, // Reduced retries
  RETRY_DELAY: 3000, // 3 seconds retry delay
  MIN_REFRESH_TIME: 60000, // Minimum 1 minute before refresh
} as const;

/**
 * Simplified Session Manager Class
 */
class SessionManager {
  private refreshTimer: number | null = null;
  private backgroundChecker: number | null = null;
  private retryCount = 0;
  private lastActivity = Date.now();

  /**
   * Setup session management with simplified logic
   */
  setupSession(session: Session): void {
    this.clearAllTimers();
    this.setupProactiveRefresh(session);
    this.setupBackgroundChecker();
    
    console.log('✅ [Session] Session management initialized');
  }

  /**
   * Setup proactive refresh with simplified timing
   */
  private setupProactiveRefresh(session: Session): void {
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    
    // Refresh 5 minutes before expiry
    const timeUntilRefresh = Math.max(
      (expiresAt - now) * 1000 - SESSION_CONFIG.REFRESH_THRESHOLD,
      SESSION_CONFIG.MIN_REFRESH_TIME
    );
    
    console.log(`⏰ [Session] Next refresh in ${Math.round(timeUntilRefresh / 60000)} minutes`);
    
    this.refreshTimer = window.setTimeout(async () => {
      await this.performRefresh();
    }, timeUntilRefresh);
  }

  /**
   * Simplified background checker
   */
  private setupBackgroundChecker(): void {
    this.backgroundChecker = window.setInterval(async () => {
      await this.performBackgroundCheck();
    }, SESSION_CONFIG.BACKGROUND_CHECK_INTERVAL);
  }

  /**
   * Perform session refresh with simplified retry logic
   */
  private async performRefresh(): Promise<void> {
    try {
      console.log('🔄 [Session] Refreshing session...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session) {
        console.log('✅ [Session] Refresh successful');
        useAuthStore.setState({ session: data.session });
        this.setupProactiveRefresh(data.session);
        this.retryCount = 0;
      }
    } catch (error) {
      console.error('❌ [Session] Refresh failed:', error);
      await this.handleRefreshFailure(error as Error);
    }
  }

  /**
   * Simplified retry logic
   */
  private async handleRefreshFailure(error: Error): Promise<void> {
    if (this.retryCount < SESSION_CONFIG.MAX_RETRY_ATTEMPTS) {
      this.retryCount++;
      console.log(`🔄 [Session] Retrying refresh (${this.retryCount}/${SESSION_CONFIG.MAX_RETRY_ATTEMPTS})`);
      
      setTimeout(async () => {
        await this.performRefresh();
      }, SESSION_CONFIG.RETRY_DELAY);
    } else {
      console.error('❌ [Session] Max retries reached');
      this.handleSessionFailure(error);
    }
  }

  /**
   * Simplified background check
   */
  private async performBackgroundCheck(): Promise<void> {
    try {
      // Check for stuck loading state
      const authState = useAuthStore.getState();
      
      if (authState.isLoading && authState.loadingStartTime) {
        const loadingDuration = Date.now() - authState.loadingStartTime;
        
        if (loadingDuration > 10000) { // 10 seconds
          console.warn('⚠️ [Session] Clearing stuck loading state');
          useAuthStore.setState({ 
            isLoading: false,
            loadingStartTime: null
          });
        }
      }
    } catch (error) {
      console.error('❌ [Session] Background check error:', error);
    }
  }

  /**
   * Handle session failure
   */
  private handleSessionFailure(error: Error): void {
    console.error('❌ [Session] Session failure:', error.message);
    
    this.clearAllTimers();
    
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Session expired. Please log in again.',
      initialized: true
    });
  }

  /**
   * Clear all timers
   */
  clearAllTimers(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.backgroundChecker) {
      clearInterval(this.backgroundChecker);
      this.backgroundChecker = null;
    }
    
    this.retryCount = 0;
    console.log('🧹 [Session] Timers cleared');
  }

  /**
   * Get session status
   */
  getSessionStatus() {
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
const sessionManager = new SessionManager();

// ============================================================================
// Public API Functions
// ============================================================================

export function setupSessionTimeout(session: Session): void {
  sessionManager.setupSession(session);
}

export function clearSessionTimeout(): void {
  sessionManager.clearAllTimers();
}

export async function checkAndRefreshSession(): Promise<Session | null> {
  try {
    console.log('🔍 [Session] Checking session...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [Session] Error getting session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('❌ [Session] Check failed:', error);
    return null;
  }
}

export async function forceRefreshSession(): Promise<Session | null> {
  try {
    console.log('🔄 [Session] Force refresh...');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ [Session] Force refresh failed:', error);
      return null;
    }
    
    if (data.session) {
      useAuthStore.setState({ session: data.session });
      sessionManager.setupSession(data.session);
      return data.session;
    }
    
    return null;
  } catch (error) {
    console.error('❌ [Session] Force refresh exception:', error);
    return null;
  }
}

export function getSessionManagerStatus() {
  return sessionManager.getSessionStatus();
}

// Export for debugging
export { sessionManager as __sessionManager };
export { SESSION_CONFIG as __SESSION_CONFIG };
