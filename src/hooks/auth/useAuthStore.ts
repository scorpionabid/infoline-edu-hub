import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserStatus } from '@/types/auth';
import { UserRole, normalizeRole } from '@/types/role';

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
      console.log("[useAuthStore] Starting login process for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("[useAuthStore] Login error:", error.message);
        set({ error: error.message, loading: false });
        return false;
      }
      
      if (data?.session) {
        console.log("[useAuthStore] Login successful, session obtained");
        set({
          session: data.session,
          isAuthenticated: true,
          loading: true // Keep loading until user data is fetched
        });
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileError) {
          console.error('[useAuthStore] Error fetching user profile:', profileError);
          set({ 
            error: 'Failed to load user profile: ' + profileError.message,
            loading: false
          });
          return false;
        }
        
        if (!profileData) {
          console.error('[useAuthStore] No profile found for user:', data.session.user.id);
          set({ 
            error: 'User profile not found',
            loading: false
          });
          return false;
        }
            
        // Also fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();
        
        if (roleError && roleError.code !== 'PGRST116') {
          console.error('[useAuthStore] Error fetching user role:', roleError);
        }
        
        // Determine user role
        const role = roleData?.role || 'schooladmin';
        console.log("[useAuthStore] User role determined:", role);
          
        // Combine profile and role data
        const fullUserData: FullUserData = {
          ...profileData,
          role: normalizeRole(role), // Ensure role is a valid UserRole
          status: (profileData.status as UserStatus) || 'active'
        };
          
        set({ 
          user: fullUserData,
          loading: false
        });
        
        console.log("[useAuthStore] Login complete. User data:", fullUserData);
        return true;
      } else {
        console.error('[useAuthStore] No session returned after login');
        set({ loading: false, error: 'No session returned after login' });
        return false;
      }
    } catch (error: any) {
      console.error('[useAuthStore] Unexpected login error:', error);
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
      console.log("[useAuthStore] Starting logout process");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[useAuthStore] Logout error:', error);
        set({ error: error.message, loading: false });
        return;
      }
      
      console.log("[useAuthStore] Logout successful");
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false
      });
    } catch (error: any) {
      console.error('[useAuthStore] Unexpected logout error:', error);
      set({ 
        loading: false,
        error: error.message || 'An unexpected error occurred during logout'
      });
    }
  },

  initializeAuth: async () => {
    set({ loading: true });

    try {
      console.log("[useAuthStore] Initializing auth");
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("[useAuthStore] Initial session:", session ? "Available" : "Not available");
      
      set({ session, isAuthenticated: !!session });

      // If we have a session, load the user profile and role
      if (session) {
        console.log("[useAuthStore] Session exists, fetching user data for:", session.user.id);
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('[useAuthStore] Error fetching user profile:', profileError);
          set({ error: profileError.message });
        } else if (!profileData) {
          console.error('[useAuthStore] No profile found for user:', session.user.id);
          set({ error: 'User profile not found' });
        } else {
          console.log("[useAuthStore] User profile fetched successfully");
          
          // Also fetch user role
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (roleError && roleError.code !== 'PGRST116') {
            console.error('[useAuthStore] Error fetching user role:', roleError);
          }
          
          // Determine user role with better logging
          let role = 'schooladmin';
          if (roleData && roleData.role) {
            role = roleData.role;
            console.log("[useAuthStore] Found role in database:", role);
          } else {
            console.warn("[useAuthStore] No role found in database, using default:", role);
          }
          
          // Combine profile and role data
          const fullUserData: FullUserData = {
            ...profileData,
            role: normalizeRole(role), // Ensure role is a valid UserRole
            status: (profileData.status as UserStatus) || 'active'
          };
          
          set({ user: fullUserData });
          console.log("[useAuthStore] Auth initialized with user data:", fullUserData);
        }
      }

      // Set up auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          console.log("[useAuthStore] Auth state changed:", _event);
          set({ session, isAuthenticated: !!session });

          if (session) {
            console.log("[useAuthStore] New session detected, fetching profile for:", session.user.id);
            // Fetch user profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('[useAuthStore] Error fetching user profile on state change:', profileError);
              set({ error: profileError.message });
            } else if (!profileData) {
              console.error('[useAuthStore] No profile found for user on state change:', session.user.id);
              set({ error: 'User profile not found' });
            } else {
              console.log("[useAuthStore] User profile fetched successfully on state change");
              
              // Also fetch user role
              const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
                
              if (roleError && roleError.code !== 'PGRST116') {
                console.error('[useAuthStore] Error fetching user role on state change:', roleError);
              }
              
              // Determine user role
              let role = 'schooladmin';
              if (roleData && roleData.role) {
                role = roleData.role;
                console.log("[useAuthStore] Found role in database on state change:", role);
              } else {
                console.warn("[useAuthStore] No role found in database on state change, using default:", role);
              }
              
              // Combine profile and role data
              const fullUserData: FullUserData = {
                ...profileData,
                role: normalizeRole(role), // Ensure role is a valid UserRole
                status: (profileData.status as UserStatus) || 'active'
              };
              
              set({ user: fullUserData });
              console.log("[useAuthStore] Auth state updated with user data:", fullUserData);
            }
          } else {
            set({ user: null });
            console.log("[useAuthStore] Auth state cleared, user set to null");
          }
        }
      );

      // Setting the initialized state to true
      set({ initialized: true, loading: false });
      console.log("[useAuthStore] Auth initialization complete");
    } catch (error: any) {
      console.error('[useAuthStore] Auth initialization error:', error);
      set({ error: error.message, loading: false, initialized: true });
    }
  },

  refreshSession: async () => {
    try {
      console.log("[useAuthStore] Refreshing auth session");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[useAuthStore] Session refresh error:', error);
        throw error;
      }
      
      console.log("[useAuthStore] Session refreshed successfully");
      set({ 
        session: data.session, 
        isAuthenticated: !!data.session 
      });

      if (data.session) {
        console.log("[useAuthStore] Fetching user profile after session refresh for:", data.session.user.id);
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileError) {
          console.error('[useAuthStore] Error fetching user profile after session refresh:', profileError);
          set({ error: profileError.message });
        } else if (!profileData) {
          console.error('[useAuthStore] No profile found for user after session refresh:', data.session.user.id);
          set({ error: 'User profile not found' });
        } else {
          console.log("[useAuthStore] User profile fetched successfully after session refresh");
          
          // Also fetch user role
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();
            
          if (roleError && roleError.code !== 'PGRST116') {
            console.error('[useAuthStore] Error fetching user role after session refresh:', roleError);
          }
          
          // Determine user role
          let role = 'schooladmin';
          if (roleData && roleData.role) {
            role = roleData.role;
            console.log("[useAuthStore] Found role in database after session refresh:", role);
          } else {
            console.warn("[useAuthStore] No role found in database after session refresh, using default:", role);
          }
          
          // Combine profile and role data
          const fullUserData: FullUserData = {
            ...profileData,
            role: normalizeRole(role), // Ensure role is a valid UserRole
            status: (profileData.status as UserStatus) || 'active'
          };
          
          set({ user: fullUserData });
          console.log("[useAuthStore] Session refresh complete with user data:", fullUserData);
        }
      }
    } catch (error: any) {
      console.error('[useAuthStore] Session refresh unexpected error:', error);
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
export const selectUserRole = (state: AuthState) => {
  if (!state.user) return null;
  // Ensure we always return a valid UserRole or null
  return normalizeRole(state.user.role);
};
export const selectRegionId = (state: AuthState) => state.user?.region_id;
export const selectSectorId = (state: AuthState) => state.user?.sector_id;
export const selectSchoolId = (state: AuthState) => state.user?.school_id;

// Utility functions
export const shouldAuthenticate = (state: AuthState) => !state.isAuthenticated && !state.loading;
export const isProtectedRoute = (path: string) => !['/', '/login', '/register', '/reset-password'].includes(path);
export const getRedirectPath = (path: string) => isProtectedRoute(path) ? path : '/dashboard';

export default useAuthStore;
