
// ============================================================================
// İnfoLine Auth System - Auth Initializer (Optimized)
// ============================================================================
// Bu fayl auth sisteminin ilkin yüklənməsini və initialization prosesini idarə edir

import { supabase } from '@/integrations/supabase/client';
import { StoreApi } from 'zustand';

type SetState<T> = StoreApi<T>['setState'];
type GetState<T> = StoreApi<T>['getState'];
import { AuthState } from './authTypes';
import { fetchUserProfile, normalizeUserProfile, createMinimalProfile } from './profileManager';
import { setupSessionTimeout, checkAndRefreshSession } from './sessionManager';

// Enhanced timeout configuration
const INIT_CONFIG = {
  TIMEOUT: 5000, // Reduced to 5 seconds
  PROFILE_TIMEOUT: 3000, // 3 seconds for profile fetch
  MAX_RETRIES: 2, // Reduced retries
  RETRY_DELAY: 2000 // 2 seconds between retries
};

// Track initialization
let initInProgress = false;
let initRetryCount = 0;

/**
 * Auth sistemini ilkin mərhələdə yükləyir (Optimized)
 */
export async function initializeAuth(set: SetState<AuthState>, get: GetState<AuthState>): Promise<void> {
  const state = get();
  
  if (state.initialized || initInProgress) {
    console.log('ℹ️ [Auth] Skipping init - already initialized or in progress');
    return;
  }
  
  console.log('🔄 [Auth] Starting optimized initialization');
  
  set({ 
    isLoading: true, 
    error: null, 
    loadingStartTime: Date.now() 
  });
  
  await performInitialization(set, get);
}

/**
 * Optimized initialization with improved error handling and timeouts
 */
export async function performInitialization(
  set: SetState<AuthState>, 
  get: GetState<AuthState>,
  loginOnly = false
): Promise<void> {
  const state = get();
  
  // Prevent concurrent initialization
  if (initInProgress) {
    console.log('ℹ️ [Auth] Init already in progress');
    return;
  }
  
  // Skip if already initialized and not a login-only call
  if (!loginOnly && state.initialized && !state.isLoading) {
    console.log('ℹ️ [Auth] Already initialized, skipping');
    return;
  }
  
  initInProgress = true;
  
  console.log('🔄 [Auth] Starting initialization...', { loginOnly });
  
  // Timeout protection
  const initTimeout = setTimeout(() => {
    console.warn('⚠️ [Auth] Init timeout reached');
    handleInitTimeout(set, get);
  }, INIT_CONFIG.TIMEOUT);
  
  try {
    set({ 
      isLoading: true, 
      loadingStartTime: Date.now(),
      error: null
    });
    
    // Get current session
    console.log('🔍 [Auth] Checking session...');
    let session = await checkAndRefreshSession();
    
    if (!session) {
      // Try direct session check as fallback
      const { data: { session: fallbackSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      session = fallbackSession;
    }
    
    if (!session?.user) {
      // No session - set not authenticated
      console.log('🔓 [Auth] No session found');
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
        initializationAttempted: true,
        error: null,
        loadingStartTime: null
      });
      return;
    }
    
    console.log('🔐 [Auth] Session found, fetching profile...');
    
    // Fetch profile with timeout
    const profileResult = await Promise.race([
      fetchUserProfile(session.user.id),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), INIT_CONFIG.PROFILE_TIMEOUT)
      )
    ]) as { profile: any; error: any };
    
    let userProfile = profileResult.profile;
    
    // Handle profile fetch issues
    if (profileResult.error || !userProfile) {
      console.warn('⚠️ [Auth] Profile fetch failed, using minimal profile');
      userProfile = createMinimalProfile(session);
    }
    
    // Normalize and set user data
    const userData = normalizeUserProfile(userProfile, session);
    
    set({
      user: userData,
      session,
      isAuthenticated: true,
      isLoading: false,
      initialized: true,
      initializationAttempted: true,
      error: null,
      loadingStartTime: null
    });
    
    // Setup session timeout
    setupSessionTimeout(session);
    
    console.log('✅ [Auth] Init successful', { 
      userId: userData.id, 
      role: userData.role 
    });
    
  } catch (error: any) {
    console.error('❌ [Auth] Init failed:', error);
    
    // Retry logic
    if (initRetryCount < INIT_CONFIG.MAX_RETRIES) {
      initRetryCount++;
      console.log(`🔄 [Auth] Retrying init (${initRetryCount}/${INIT_CONFIG.MAX_RETRIES})`);
      
      setTimeout(() => {
        initInProgress = false;
        performInitialization(set, get, loginOnly);
      }, INIT_CONFIG.RETRY_DELAY);
      
      return;
    }
    
    // Max retries reached
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      initialized: true,
      initializationAttempted: true,
      error: error.message || 'İnisiallaşdırma uğursuz oldu',
      loadingStartTime: null
    });
    
  } finally {
    clearTimeout(initTimeout);
    initInProgress = false;
    initRetryCount = 0;
  }
}

/**
 * Handle initialization timeout
 */
function handleInitTimeout(set: SetState<AuthState>, get: GetState<AuthState>): void {
  const state = get();
  
  if (state.isLoading) {
    console.warn('⚠️ [Auth] Initialization timeout - clearing loading state');
    
    // If we have a session but stuck on loading, try to recover
    if (state.session?.user) {
      const userData = createMinimalProfile(state.session);
      set({
        user: normalizeUserProfile(userData, state.session),
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
        error: null,
        loadingStartTime: null
      });
    } else {
      // No session - clear everything
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
        error: 'Yüklənmə vaxtı bitdi',
        loadingStartTime: null
      });
    }
  }
  
  initInProgress = false;
}
