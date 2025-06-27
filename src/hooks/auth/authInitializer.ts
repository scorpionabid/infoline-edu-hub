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
import { setupSessionTimeout } from './sessionManager';

// Track initialization attempts
let initRetryCount = 0;

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
  
  // Timeout protection with retry
  const initTimeout = setTimeout(() => {
    const currentState = get();
    if (currentState.isLoading) {
      console.warn(`⚠️ [Auth] Initialization timed out after ${AUTH_TIMEOUT_CONFIG.INIT_TIMEOUT}ms`);
      
      if (initRetryCount < AUTH_TIMEOUT_CONFIG.MAX_RETRIES) {
        initRetryCount++;
        console.log(`🔄 [Auth] Retrying initialization (attempt ${initRetryCount}/${AUTH_TIMEOUT_CONFIG.MAX_RETRIES})`);
        
        setTimeout(() => {
          performInitialization(set, get, loginOnly);
        }, AUTH_TIMEOUT_CONFIG.RETRY_DELAY);
      } else {
        console.error('❌ [Auth] Max initialization retries reached, resetting state');
        set({ 
          isLoading: false, 
          initialized: true, 
          initializationAttempted: true, 
          error: 'Giriş vaxtı bitdi. Zəhmət olmasa yenidən cəhd edin.' 
        });
        initRetryCount = 0;
      }
    }
  }, AUTH_TIMEOUT_CONFIG.INIT_TIMEOUT);
  
  // Skip if already initialized with user and not forced
  if (state.initialized && !loginOnly && state.user) {
    console.log('ℹ️ [Auth] Already initialized with user, skipping');
    clearTimeout(initTimeout);
    return;
  }
  
  // Prevent concurrent initializations
  if (state.isLoading && !loginOnly) {
    const loadingStart = state.loadingStartTime || 0;
    const loadingDuration = Date.now() - loadingStart;
    
    if (loadingDuration > AUTH_TIMEOUT_CONFIG.INIT_TIMEOUT) {
      console.warn('⚠️ [Auth] Detected stuck loading state, resetting');
      set({ isLoading: false });
    } else {
      console.log('ℹ️ [Auth] Initialization already in progress, skipping');
      clearTimeout(initTimeout);
      return;
    }
  }
  
  console.log('🔄 [Auth] Starting initialization...');
  
  // Set loading state
  set({ 
    isLoading: true, 
    loadingStartTime: Date.now(),
    initializationAttempted: true
  });
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [Auth] Session error:', sessionError);
      throw sessionError;
    }
    
    if (session?.user) {
      console.log('🔐 [Auth] Found session for user:', { userId: session.user.id, email: session.user.email });
      
      // Fetch user profile with timeout protection
      const { profile, error: profileError } = await fetchUserProfile(session.user.id);

      // Ətraflı profil məlumatlarını log edirik
      console.log('👤 [Auth] Profile data for initialization:', profile);

      if (profileError) {
        console.error('❌ [Auth] Error fetching profile during initialization:', profileError);
        throw profileError;
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
          error: null
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
          error: 'Profile not found'
        });
      }
    } else {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
        error: null
      });
      console.log('🔓 [Auth] No active session found');
    }
  } catch (error: any) {
    console.error('❌ [Auth] Initialization failed', { error: error.message });
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false, 
      initialized: true,
      error: error.message || 'Initialization failed'
    });
  } finally {
    clearTimeout(initTimeout);
    initRetryCount = 0;
  }
}
