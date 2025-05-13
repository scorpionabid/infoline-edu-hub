
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/auth';

export interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: FullUserData | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateUser: (userData: Partial<FullUserData>) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  initialized: false,
  isAuthenticated: false,
  
  setUser: (user) => set((state) => ({
    ...state,
    user,
    isAuthenticated: !!user
  })),
  
  setSession: (session) => set((state) => ({
    ...state,
    session,
    isAuthenticated: !!session
  })),
  
  setLoading: (loading) => set((state) => ({
    ...state,
    loading
  })),
  
  setError: (error) => set((state) => ({
    ...state,
    error
  })),
  
  clearError: () => set((state) => ({
    ...state,
    error: null
  })),
  
  updateUser: (userData) => set((state) => ({
    ...state,
    user: state.user ? { ...state.user, ...userData } : null
  })),

  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }
      
      if (data?.session) {
        set({
          session: data.session,
          isAuthenticated: true,
          loading: false
        });
        
        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (!userError && userData) {
          set({ user: userData as FullUserData });
        } else {
          console.error('Error fetching user profile:', userError);
        }
        
        return true;
      } else {
        set({ loading: false, error: 'No session returned after login' });
        return false;
      }
    } catch (error: any) {
      set({ 
        loading: false,
        error: error.message || 'An unexpected error occurred during login'
      });
      return false;
    }
  },
  
  logout: async () => {
    set({ loading: true });
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        set({ error: error.message, loading: false });
        return;
      }
      
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false
      });
    } catch (error: any) {
      set({ 
        loading: false,
        error: error.message || 'An unexpected error occurred during logout'
      });
    }
  },

  initializeAuth: async () => {
    set({ loading: true });

    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, isAuthenticated: !!session });

      // If we have a session, load the user profile
      if (session) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user profile:', userError);
          set({ error: userError.message });
        } else {
          set({ user: userData as FullUserData });
        }
      }

      // Set up auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          set({ session, isAuthenticated: !!session });

          if (session) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) {
              console.error('Error fetching user profile:', userError);
              set({ error: userError.message });
            } else {
              set({ user: userData as FullUserData });
            }
          } else {
            set({ user: null });
          }
        }
      );

      // Setting the initialized state to true
      set({ initialized: true, loading: false });
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      set({ error: error.message, loading: false, initialized: true });
    }
  },

  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      set({ 
        session: data.session, 
        isAuthenticated: !!data.session 
      });

      if (data.session) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user profile:', userError);
          set({ error: userError.message });
        } else {
          set({ user: userData as FullUserData });
        }
      }
    } catch (error: any) {
      console.error('Session refresh error:', error);
      set({ error: error.message });
    }
  }
}));

// Selector functions - export these to be used with useAuthStore
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.loading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectRegionId = (state: AuthState) => state.user?.region_id;
export const selectSectorId = (state: AuthState) => state.user?.sector_id;
export const selectSchoolId = (state: AuthState) => state.user?.school_id;

// Utility functions
export const shouldAuthenticate = (state: AuthState) => !state.isAuthenticated && !state.loading;
export const isProtectedRoute = (path: string) => !['/', '/login', '/register', '/reset-password'].includes(path);
export const getRedirectPath = (path: string) => isProtectedRoute(path) ? path : '/dashboard';

export default useAuthStore;
