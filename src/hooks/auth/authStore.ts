// ============================================================================
// İnfoLine Auth System - Auth Store
// ============================================================================
// Bu fayl auth sisteminin əsas zustand store komponentini təmin edir

import { create } from 'zustand';
import { AuthState } from './authTypes';
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
import { setupSessionTimeout, clearSessionTimeout } from './sessionManager';

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
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔄 [AuthStateChange]', { event, session: session?.user?.id });
  
  // Handle only essential events to prevent loops
  switch (event) {
    case 'INITIAL_SESSION':
    case 'SIGNED_IN':
      if (session?.user) {
        console.log('🔄 [AuthStateChange] Processing session:', event);
        const state = useAuthStore.getState();
        
        // Clear any existing timeout for session cleanup
        clearSessionTimeout();
        
        // Setup automatic session refresh checker
        setupSessionTimeout(session);
        
        // Only process if we don't already have a user or if state is currently loading
        if ((!state.user && !state.isLoading) || state.isLoading) {
          console.log('🔄 [AuthStateChange] Initializing user from session');
          await state.performInitialization(true);
        }
      }
      break;
      
    case 'SIGNED_OUT':
      console.log('🔄 [AuthStateChange] User signed out, clearing state');
      // Clear any existing timeout for session cleanup
      clearSessionTimeout();
      
      useAuthStore.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        error: null,
        initialized: true,
        isLoading: false,
        initializationAttempted: true
      });
      break;
      
    case 'TOKEN_REFRESHED':
      console.log('🔄 [AuthStateChange] Token refreshed');
      if (session) {
        // Reset the session timeout when token is refreshed
        clearSessionTimeout();
        setupSessionTimeout(session);
        
        // Update session in state
        useAuthStore.setState({ session });
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
