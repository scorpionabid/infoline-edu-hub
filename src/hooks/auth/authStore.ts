
// ============================================================================
// İnfoLine Auth System - Auth Store (Loop Fixed Version)
// ============================================================================
// Bu fayl auth sisteminin əsas zustand store komponentini təmin edir

import { create } from 'zustand';
import type { AuthState } from '@/types/auth'; // Updated to unified types
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

// ========== Auth State Change Listener - Loop Fixed Version ==========
import { supabase } from '@/integrations/supabase/client';

// Loop prevention variables
let isProcessingEvent = false;
let lastEventTimestamp = 0;
let eventQueue: Array<{ event: string; session: any; timestamp: number }> = [];
let isInitialized = false;

// Process events in queue - prevents multiple simultaneous processing
const processEventQueue = async () => {
  if (isProcessingEvent || eventQueue.length === 0) return;
  
  isProcessingEvent = true;
  const currentEvent = eventQueue.shift();
  
  if (!currentEvent) {
    isProcessingEvent = false;
    return;
  }
  
  const { event, session } = currentEvent;
  
  try {
    console.log('🔄 [AuthStateChange] Processing queued event:', event);
    
    switch (event) {
      case 'INITIAL_SESSION':
        if (session?.user && !isInitialized) {
          isInitialized = true;
          
          // Set session immediately
          useAuthStore.setState({
            session,
            isLoading: true,
            loadingStartTime: Date.now(),
            error: null
          });
          
          // Setup session timeout
          clearSessionTimeout();
          setupSessionTimeout(session);
          
          // Initialize with timeout protection
          const initPromise = useAuthStore.getState().performInitialization(false);
          const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
              console.warn('⚠️ [AuthStateChange] Initialization timeout');
              resolve('timeout');
            }, 5000);
          });
          
          try {
            const result = await Promise.race([initPromise, timeoutPromise]);
            if (result === 'timeout') {
              // Fallback state
              useAuthStore.setState({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || '',
                  name: session.user.user_metadata?.full_name || '',
                  role: 'schooladmin' as any
                },
                isAuthenticated: true,
                isLoading: false,
                initialized: true,
                loadingStartTime: null
              });
            }
          } catch (error) {
            console.error('❌ [AuthStateChange] Initialization failed:', error);
            useAuthStore.setState({
              isLoading: false,
              error: 'Initialization failed',
              loadingStartTime: null
            });
          }
        } else if (!session?.user) {
          useAuthStore.setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true,
            initializationAttempted: true,
            loadingStartTime: null,
            error: null
          });
        }
        break;
        
      case 'SIGNED_IN':
        if (session?.user) {
          const currentState = useAuthStore.getState();
          
          // Skip if user is already authenticated with same ID
          if (currentState.user?.id === session.user.id && currentState.isAuthenticated) {
            console.log('ℹ️ [AuthStateChange] SIGNED_IN skipped - user already authenticated');
            break;
          }
          
          clearSessionTimeout();
          setupSessionTimeout(session);
          
          await useAuthStore.getState().performInitialization(true);
        }
        break;
        
      case 'SIGNED_OUT':
        console.log('🔄 [AuthStateChange] Processing SIGNED_OUT');
        clearSessionTimeout();
        isInitialized = false;
        
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
        if (session) {
          console.log('🔄 [AuthStateChange] Token refreshed');
          useAuthStore.setState({ session });
          clearSessionTimeout();
          setupSessionTimeout(session);
        }
        break;
        
      case 'USER_UPDATED':
        if (session?.user) {
          console.log('🔄 [AuthStateChange] User updated');
          const state = useAuthStore.getState();
          if (state.user) {
            state.fetchUser();
          }
        }
        break;
    }
  } catch (error) {
    console.error('❌ [AuthStateChange] Event processing failed:', error);
    useAuthStore.setState({
      isLoading: false,
      error: 'Auth state change failed',
      loadingStartTime: null
    });
  } finally {
    isProcessingEvent = false;
    
    // Process next event in queue if any
    if (eventQueue.length > 0) {
      setTimeout(processEventQueue, 50); // Small delay to prevent stack overflow
    }
  }
};

// Enhanced auth state change listener with queue system
supabase.auth.onAuthStateChange(async (event, session) => {
  const eventTimestamp = Date.now();
  
  // Prevent rapid duplicate events
  if (eventTimestamp - lastEventTimestamp < 150) {
    console.log('⚠️ [AuthStateChange] Skipping duplicate event within 150ms');
    return;
  }
  
  lastEventTimestamp = eventTimestamp;
  
  console.log('🔄 [AuthStateChange] Queuing event:', { 
    event, 
    hasSession: !!session, 
    userId: session?.user?.id,
    queueLength: eventQueue.length
  });
  
  // Add to queue instead of processing immediately
  eventQueue.push({ event, session, timestamp: eventTimestamp });
  
  // Limit queue size to prevent memory issues
  if (eventQueue.length > 5) {
    eventQueue = eventQueue.slice(-3); // Keep only last 3 events
  }
  
  // Process queue
  processEventQueue();
});