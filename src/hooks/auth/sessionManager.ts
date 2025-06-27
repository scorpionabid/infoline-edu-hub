// ============================================================================
// İnfoLine Auth System - Session Manager
// ============================================================================
// Bu fayl session idarəetməsi, token təzələnməsi və timeout funksiyaları təmin edir

import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';
import { AUTH_TIMEOUT_CONFIG } from './authTypes';

// Session timeout cleaner reference
let sessionTimeoutCleaner: number | null = null;

/**
 * Session vaxtını təyin edir və vaxt bitməzdən əvvəl təzələnməsini təmin edir
 * @param session Current auth session
 */
export function setupSessionTimeout(session: Session): void {
  // Get expiry from session if available
  const expiresAt = session?.expires_at || 0;
  const now = Math.floor(Date.now() / 1000);
  
  // Calculate time until 10 minutes before expiry (more conservative)
  const timeUntilRefresh = expiresAt ? (expiresAt - now - 600) * 1000 : 3600000; // Default 1h
  
  // Ensure refresh time is reasonable (between 5 minutes and 12 hours)
  const normalizedRefreshTime = Math.min(
    Math.max(timeUntilRefresh, 5 * 60 * 1000), // At least 5 minutes
    12 * 60 * 60 * 1000 // Max 12 hours
  );
  
  // Log when session refresh will happen
  console.log('⏰ [Auth] Setting up session refresh in:', {
    minutes: Math.floor(normalizedRefreshTime / 60000),
    normalizedMs: normalizedRefreshTime,
    originalMs: timeUntilRefresh,
    expiresAt: new Date((expiresAt || 0) * 1000).toLocaleString()
  });
  
  // Set timeout to refresh session before it expires
  sessionTimeoutCleaner = window.setTimeout(async () => {
    const state = useAuthStore.getState();
    
    if (state.isLoading) {
      // Fix for stuck loading state - auto-reset if loading for > 30 seconds
      const loadingStartTime = state.loadingStartTime || Date.now();
      const loadingDuration = Date.now() - loadingStartTime;
      
      if (loadingDuration > AUTH_TIMEOUT_CONFIG.INIT_TIMEOUT) {
        console.warn('⚠️ [Auth] Session refresh found stuck loading state - resetting loading state');
        useAuthStore.setState({ isLoading: false });
      }
    }
    
    console.log('🔄 [Auth] Session refresh triggered by timeout');
    
    // Try to do a silent refresh first
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ [Auth] Silent session refresh failed:', error);
        // If silent refresh fails, try to re-initialize
        const state = useAuthStore.getState();
        if (state.user) {
          console.log('🔄 [Auth] Attempting re-initialization after failed refresh');
          await state.performInitialization();
        }
      } else {
        console.log('✅ [Auth] Silent session refresh successful');
      }
    } catch (e) {
      console.error('❌ [Auth] Session refresh error:', e);
      
      // If refresh throws error, reset loading state to avoid stuck UI
      useAuthStore.setState({ isLoading: false });
    }
  }, normalizedRefreshTime);
}

/**
 * Session timeout-nu təmizləyir
 */
export function clearSessionTimeout(): void {
  if (sessionTimeoutCleaner !== null) {
    clearTimeout(sessionTimeoutCleaner);
    sessionTimeoutCleaner = null;
  }
}

/**
 * Session status-nu yoxlayır və lazım gələrsə təzələyir
 * @returns Promise resolving to refreshed session or null
 */
export async function checkAndRefreshSession(): Promise<Session | null> {
  try {
    console.log('🔍 [Auth] Checking session status');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [Auth] Error getting session:', error);
      return null;
    }
    
    if (!session) {
      console.log('ℹ️ [Auth] No active session found');
      return null;
    }
    
    // Check if session needs refreshing (expires in less than 10 minutes)
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < 600) {
      console.log('🔄 [Auth] Session expires soon, refreshing now');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ [Auth] Session refresh failed:', error);
        return null;
      }
      
      console.log('✅ [Auth] Session refreshed successfully');
      return data.session;
    }
    
    return session;
  } catch (e) {
    console.error('❌ [Auth] Session check failed:', e);
    return null;
  }
}
