// ============================================================================
// İnfoLine Auth System - Auth Store
// ============================================================================
// Bu fayl auth sisteminin əsas zustand store komponentini təmin edir

import { create } from 'zustand';
import { AuthState } from './authTypes';
import { AUTH_TIMEOUT_CONFIG } from './authTypes';
import { 
  signIn, 
  signOut, 
  resetPassword, 
  updatePassword, 
  updateProfile, 
  fetchUser,
  hasPermission
} from './authActions';
import { initializeAuth, performInitialization } from './authInitializer';
import { setupSessionTimeout, clearSessionTimeout, forceRefreshSession } from './sessionManager';

// Create the auth store
export const useAuthStore = create<AuthState>((set, get) => ({
  // Base state
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  initializationAttempted: false,
  error: null,
  loadingStartTime: null,
  signInAttemptTime: null,
  
  // Auth actions
  signIn: async (email: string, password: string) => {
    await signIn(email, password, set, get);
  },
  
  signOut: async () => {
    await signOut(set, get);
  },
  
  initializeAuth: async () => {
    await initializeAuth(set, get);
  },
  
  performInitialization: async (loginOnly?: boolean) => {
    await performInitialization(set, get, loginOnly);
  },
  
  resetPassword: async (email: string) => {
    return await resetPassword(email, set, get);
  },
  
  updatePassword: async (newPassword: string) => {
    return await updatePassword(newPassword, set, get);
  },
  
  updateProfile: async (profileData) => {
    await updateProfile(profileData, set, get);
  },
  
  fetchUser: async () => {
    await fetchUser(set, get);
  },
  
  hasPermission: (requiredRole) => {
    return hasPermission(requiredRole, get);
  }
}));

// ========== Store Selectors ==========

// Auth state selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;

// User data selectors
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectRegionId = (state: AuthState) => state.user?.region_id || state.user?.regionId;
export const selectSectorId = (state: AuthState) => state.user?.sector_id || state.user?.sectorId;
export const selectSchoolId = (state: AuthState) => state.user?.school_id || state.user?.schoolId;

// Action selectors
export const selectUpdateProfile = (state: AuthState) => state.updateProfile;
export const selectUpdatePassword = (state: AuthState) => state.updatePassword;
export const selectHasPermission = (state: AuthState) => state.hasPermission;
export const selectSignOut = (state: AuthState) => state.signOut;

// Route helpers
export const shouldAuthenticate = (pathname: string) => {
  return !pathname.includes('/login') && 
         !pathname.includes('/register') && 
         !pathname.includes('/forgot-password');
};

export const isProtectedRoute = (pathname: string) => {
  return !pathname.includes('/login') && 
         !pathname.includes('/register') && 
         !pathname.includes('/register-success') && 
         !pathname.includes('/forgot-password');
};

// Set up auth state change listener
import { supabase } from '@/integrations/supabase/client';

// Auth hadisələrini izləmək üçün təkmilləşdirilmiş listener
// CRITICAL FIX: Prevent race condition between INITIAL_SESSION and SIGNED_IN
let isProcessingEvent = false;
let lastProcessedSessionId: string | null = null;

supabase.auth.onAuthStateChange(async (event, session) => {
  const sessionId = session?.user?.id || null;
  console.log('🔄 [AuthStateChange]', { event, sessionId, isProcessing: isProcessingEvent });
  
  // Prevent concurrent processing of the same session
  if (isProcessingEvent && sessionId === lastProcessedSessionId) {
    console.log('⚠️ [AuthStateChange] Skipping duplicate event processing', { event, sessionId });
    return;
  }
  
  // Handle only essential events to prevent loops
  switch (event) {
    case 'INITIAL_SESSION':
      console.log('🔄 [AuthStateChange] Received INITIAL_SESSION event with user:', sessionId);
      
      if (session?.user) {
        console.log('🔄 [AuthStateChange] Processing initial session with user');
        
        // FAST PATH: If we have a session and user, set state immediately
        const currentState = useAuthStore.getState();
        
        // Quick check - if we already have the same user, just update session
        if (currentState.user?.id === session.user.id && currentState.isAuthenticated) {
          console.log('✅ [AuthStateChange] Same user, quick session update');
          useAuthStore.setState({ session });
          setupSessionTimeout(session);
          return;
        }
        
        // Prevent concurrent processing
        if (isProcessingEvent) {
          console.log('⚠️ [AuthStateChange] Already processing, skipping');
          return;
        }
        
        isProcessingEvent = true;
        lastProcessedSessionId = sessionId;
        
        try {
          // Clear existing timeouts
          clearSessionTimeout();
          setupSessionTimeout(session);
          
          // FAST INITIALIZATION - Set state immediately, fetch profile async
          useAuthStore.setState({
            session,
            isLoading: true,
            loadingStartTime: Date.now(),
            error: null
          });
          
          // Background profile fetch with timeout
          const profileTimeout = setTimeout(() => {
            console.warn('⚠️ [AuthStateChange] Profile fetch timeout, using session data');
            // Use basic session data as fallback
            useAuthStore.setState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || '',
                name: session.user.user_metadata?.full_name || '',
                role: 'user' as any // Will be updated when profile loads
              },
              isAuthenticated: true,
              isLoading: false,
              initialized: true
            });
            isProcessingEvent = false;
          }, 5000); // 5 second timeout
          
          // Fetch profile in background
          const state = useAuthStore.getState();
          await state.performInitialization(false);
          clearTimeout(profileTimeout);
          
        } catch (error) {
          console.error('❌ [AuthStateChange] INITIAL_SESSION processing failed:', error);
          // Fallback to basic session data
          useAuthStore.setState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || '',
              name: session.user.user_metadata?.full_name || '',
              role: 'user' as any
            },
            isAuthenticated: true,
            isLoading: false,
            initialized: true,
            error: null
          });
        } finally {
          isProcessingEvent = false;
        }
      } else {
        // No session on initial load - normal case for logged out users
        console.log('🔓 [AuthStateChange] No initial session, clearing loading state');
        
        useAuthStore.setState({
          isLoading: false,
          initialized: true,
          initializationAttempted: true,
          loadingStartTime: null,
          user: null,
          session: null,
          isAuthenticated: false
        });
      }
      break;
      
    case 'SIGNED_IN':
      if (session?.user) {
        console.log('🔄 [AuthStateChange] User signed in');
        
        // Skip if we already processed this session in INITIAL_SESSION
        if (sessionId === lastProcessedSessionId) {
          console.log('ℹ️ [AuthStateChange] SIGNED_IN skipped - already processed in INITIAL_SESSION');
          return;
        }
        
        isProcessingEvent = true;
        lastProcessedSessionId = sessionId;
        
        try {
          const state = useAuthStore.getState();
          
          // Clear any existing timeout for session cleanup
          clearSessionTimeout();
          
          // Setup automatic session refresh checker
          setupSessionTimeout(session);
          
          // For SIGNED_IN always initialize
          console.log('🔄 [AuthStateChange] Initializing after sign in');
          await state.performInitialization(true);
          
        } catch (error) {
          console.error('❌ [AuthStateChange] SIGNED_IN processing failed:', error);
          useAuthStore.setState({
            isLoading: false,
            error: 'Giriş xətası baş verdi'
          });
        } finally {
          isProcessingEvent = false;
        }
      }
      break;
      
    case 'SIGNED_OUT':
      console.log('🔄 [AuthStateChange] User signed out, clearing state');
      // Clear any existing timeout for session cleanup
      clearSessionTimeout();
      
      // Reset state completely on sign out
      useAuthStore.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        error: null,
        initialized: true,
        isLoading: false,
        initializationAttempted: true,
        loadingStartTime: null,
        signInAttemptTime: null
      });
      break;
      
    case 'TOKEN_REFRESHED':
      console.log('🔄 [AuthStateChange] Token refreshed');
      if (session) {
        // Update session in state first
        useAuthStore.setState({ session });
        
        // Reset the session timeout with enhanced manager
        clearSessionTimeout();
        setupSessionTimeout(session);
        
        console.log('✅ [AuthStateChange] Session updated and timeout reset');
      }
      break;
      
    case 'USER_UPDATED':
      if (session?.user) {
        console.log('🔄 [AuthStateChange] User updated, refreshing profile');
        const state = useAuthStore.getState();
        if (state.user) {
          state.fetchUser();
        }
      }
      break;
  }
});
