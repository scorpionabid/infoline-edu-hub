import { create } from 'zustand';
import { FullUserData } from '@/types/auth';
import { Session } from '@supabase/supabase-js';
import { AuthService } from '@/services/auth/AuthService';

interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  setUser: (user: FullUserData | null) => void;
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  
  // Auth Operations
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

// Flag to prevent double initialization
let authInitializing = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  initialized: false,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const { user, session, error } = await AuthService.login(email, password);
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return false;
      }
      
      if (session && user) {
        set({
          user,
          session,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      } else {
        set({ error: 'Login unsuccessful', isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await AuthService.logout();
      
      // Always clear local state regardless of API response
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (err: any) {
      console.error('Logout error:', err);
      
      // Still clear local state even if API fails
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: err.message
      });
    }
  },
  
  refreshSession: async () => {
    const { isLoading } = get();
    if (isLoading) return;
    
    set({ isLoading: true });
    
    try {
      const { session, error } = await AuthService.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        if (error.message.includes('JWT') || error.message.includes('session')) {
          // Clear auth state on token issues
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please login again.'
          });
        } else {
          set({ isLoading: false, error: error.message });
        }
        return;
      }
      
      if (session) {
        set({ session });
        
        // Fetch user data with the refreshed session
        const userData = await AuthService.fetchUserData(session);
        
        if (userData) {
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set({ isLoading: false, error: 'Failed to load user data' });
        }
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (err: any) {
      console.error('Session refresh exception:', err);
      set({ isLoading: false, error: err.message });
    }
  },
  
  clearError: () => set({ error: null }),
  
  initializeAuth: async () => {
    // Prevent concurrent initializations
    if (authInitializing || get().initialized) return;
    
    authInitializing = true;
    set({ isLoading: true });
    
    try {
      // Setup auth state listener will be handled by useAuth2
      
      // Check for existing session
      const { session, error } = await AuthService.getSession();
      
      if (error) {
        console.error('Session loading error:', error);
        set({ isLoading: false, error: error.message });
        authInitializing = false;
        return;
      }
      
      if (session) {
        set({ session });
        
        const userData = await AuthService.fetchUserData(session);
        
        if (userData) {
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            initialized: true
          });
        } else {
          set({
            isLoading: false,
            initialized: true
          });
        }
      } else {
        set({
          isLoading: false,
          isAuthenticated: false,
          initialized: true
        });
      }
    } catch (err: any) {
      console.error('Auth initialization error:', err);
      set({
        isLoading: false,
        error: err.message,
        initialized: true
      });
    }
    
    authInitializing = false;
  }
}));

// Selector functions for better performance
export const selectUser = (state: AuthState) => state.user;
export const selectSession = (state: AuthState) => state.session;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectUserRole = (state: AuthState) => state.user?.role || null;
export const selectError = (state: AuthState) => state.error; // Add the missing selectError selector
export const selectRegionId = (state: AuthState) => state.user?.region_id || null;
export const selectSectorId = (state: AuthState) => state.user?.sector_id || null;
export const selectSchoolId = (state: AuthState) => state.user?.school_id || null;

// Helper functions
export const shouldAuthenticate = () => true; // Always require authentication
export const isProtectedRoute = (pathname: string) => !['login', 'register', 'forgot-password', 'reset-password'].some(route => pathname.includes(route));
export const getRedirectPath = (role: string | null) => {
  return '/dashboard';
};
