// ============================================================================
// İnfoLine Auth System - Auth Initializer
// ============================================================================
// Bu fayl auth sisteminin ilkin yüklənməsini və initialization prosesini idarə edir

import { supabase } from '@/integrations/supabase/client';
import { StoreApi } from 'zustand';

type SetState<T> = StoreApi<T>['setState'];
type GetState<T> = StoreApi<T>['getState'];
import { AuthState, AUTH_TIMEOUT_CONFIG } from './authTypes';
import { fetchUserProfile, normalizeUserProfile, createMinimalProfile } from './profileManager';
import { setupSessionTimeout, checkAndRefreshSession } from './sessionManager';

// Track initialization attempts
let initRetryCount = 0;
let currentlyInitializingSessionId: string | null = null;

/**
 * Auth sistemini ilkin mərhələdə yükləyir
 */
export async function initializeAuth(set: SetState<AuthState>, get: GetState<AuthState>): Promise<void> {
  const state = get();
  
  if (state.initialized || state.isLoading) {
    console.log('ℹ️ [Auth] Skipping initialization, already initialized or loading');
    return;
  }
  
  console.log('🔄 [Auth] Starting initialization');
  
  set({ 
    isLoading: true, 
    error: null, 
    loadingStartTime: Date.now() 
  });
  
  await performInitialization(set, get);
}

/**
 * Auth sisteminin əsas yüklənmə və initialization funksiyası
 * İstifadəçi sessiyasını, profilini və məlumatlarını yükləyir
 * @param loginOnly Only initialize after login (skip if already initialized)
 */
export async function performInitialization(
  set: SetState<AuthState>, 
  get: GetState<AuthState>,
  loginOnly = false
): Promise<void> {
  const state = get();
  
  // Special case for page refresh (F5) handling
  // Even if a loginOnly=true is passed, we need to handle page refresh case
  const isPageRefresh = !loginOnly && state.isLoading && !state.user;
  if (isPageRefresh) {
    console.log('🔄 [Auth] Detected possible page refresh, proceeding with initialization');
    // Continue with initialization for page refresh case
  }
  
  // Enhanced duplicate prevention
  const sessionId = state.session?.user?.id || null;
  
  // Prevent duplicate initialization of the same session
  if (currentlyInitializingSessionId === sessionId && sessionId !== null) {
    console.log('⚠️ [Auth] Already initializing this session, skipping', { sessionId });
    return;
  }
  
  // Prevent concurrent initializations but handle stuck states
  if (state.isLoading && !loginOnly && !isPageRefresh) {
    const loadingStart = state.loadingStartTime || 0;
    const loadingDuration = Date.now() - loadingStart;
    
    if (loadingDuration > AUTH_TIMEOUT_CONFIG.INIT_TIMEOUT / 2) { // More aggressive timeout check
      console.warn('⚠️ [Auth] Detected stuck loading state, resetting and continuing');
      set({ 
        isLoading: true,  // Keep loading but update timestamp
        loadingStartTime: Date.now(), // Reset timer
        error: null
      });
      // Continue with initialization instead of skipping
    } else {
      console.log('ℹ️ [Auth] Initialization already in progress, skipping');
      return;
    }
  }
  
  console.log('🔄 [Auth] Starting initialization...');
  
  // Mark this session as being initialized
  if (sessionId) {
    currentlyInitializingSessionId = sessionId;
  }
  
  // Set loading state
  set({ 
    isLoading: true, 
    loadingStartTime: Date.now(),
    initializationAttempted: true
  });
  
  // Timeout protection with retry and more aggressive timeout
  const initTimeout = setTimeout(() => {
    const currentState = get();
    if (currentState.isLoading) {
      console.warn(`⚠️ [Auth] Initialization timed out after ${AUTH_TIMEOUT_CONFIG.INIT_TIMEOUT}ms`);
      
      if (initRetryCount < AUTH_TIMEOUT_CONFIG.MAX_RETRIES) {
        initRetryCount++;
        console.log(`🔄 [Auth] Retrying initialization (attempt ${initRetryCount}/${AUTH_TIMEOUT_CONFIG.MAX_RETRIES})`);
        
        // Clear current session tracking
        currentlyInitializingSessionId = null;
        
        setTimeout(() => {
          performInitialization(set, get, false); // Force loginOnly=false for retries
        }, AUTH_TIMEOUT_CONFIG.RETRY_DELAY);
      } else {
        console.error('❌ [Auth] Max initialization retries reached, resetting state');
        set({ 
          isLoading: false, 
          initialized: true, 
          initializationAttempted: true, 
          loadingStartTime: null,
          error: 'Giriş vaxtı bitdi. Zəhmət olmasa yenidən cəhd edin.' 
        });
        initRetryCount = 0;
        currentlyInitializingSessionId = null;
      }
    }
  }, AUTH_TIMEOUT_CONFIG.INIT_TIMEOUT);
  
  try {
    // Check if an INITIAL_SESSION case with no user is just being handled
    const currState = get();
    if (!loginOnly && !currState.user && currState.initialized) {
      console.log('ℹ️ [Auth] Already initialized with no user, just clearing loading state');
      set({
        isLoading: false,
        error: null
      });
      return;
    }

    // Get current session with enhanced check
    console.log('🔍 [Auth] Checking current session...');
    let session = await checkAndRefreshSession();
    
    if (!session) {
      // Try direct session check as fallback
      const { data: { session: fallbackSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [Auth] Session error:', sessionError);
        throw sessionError;
      }
      
      if (fallbackSession) {
        console.log('🔐 [Auth] Found session via fallback method');
        session = fallbackSession;
      } else {
        // No session found at all
        console.log('🔓 [Auth] No active session found, setting not authenticated');
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
    }
    
    if (session?.user) {
      console.log('🔐 [Auth] Found session for user:', { userId: session.user.id, email: session.user.email });
      
      // Fetch user profile with timeout protection
      const { profile, error: profileError } = await fetchUserProfile(session.user.id);

      // Ətraflı profil məlumatlarını log edirik
      console.log('👤 [Auth] Profile data for initialization:', profile);

      if (profileError) {
        console.error('❌ [Auth] Error fetching profile during initialization:', profileError);
        set({
          isLoading: false,
          error: `Profil məlumatları yüklənə bilmədi: ${profileError.message}`,
          initialized: true
        });
        return;
      }

      // Force continue even if profile fetch had issues
      const userProfile = profile || createMinimalProfile(session);

      if (userProfile) {
        // Normalize profile data
        const userData = normalizeUserProfile(userProfile, session);
        
        set({
          user: userData,
          session,
          isAuthenticated: true,
          isLoading: false,
          initialized: true,
          error: null,
          loadingStartTime: null  // Clear loading time
        });
        
        // Set up session timeout
        setupSessionTimeout(session);
        
        console.log('✅ [Auth] Initialization successful', { 
          userId: userData.id, 
          role: userData.role,
          email: userData.email,
          has_region_id: !!userData.region_id,
          has_sector_id: !!userData.sector_id, 
          has_school_id: !!userData.school_id 
        });
      } else {
        console.warn('⚠️ [Auth] Profile not found during initialization');
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
          error: 'Profil məlumatları tapılmadı',
          loadingStartTime: null  // Clear loading time
        });
      }
    } else {
      // This should not happen as we already handled the no-session case above
      console.log('🔓 [Auth] No session user found (unexpected), setting not authenticated');
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
        initializationAttempted: true,
        error: null,
        loadingStartTime: null  // Clear loading time
      });
    }
  } catch (error: any) {
    console.error('❌ [Auth] Initialization failed', { error: error.message });
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false, 
      initialized: true,
      initializationAttempted: true,
      loadingStartTime: null,
      error: error.message || 'Giriş xətası. Yenidən cəhd edin.'
    });
  } finally {
    clearTimeout(initTimeout);
    initRetryCount = 0;
    // Clear current session tracking
    currentlyInitializingSessionId = null;
  }
}
