import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';
import { FullUserData, UserRole } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Types
interface AuthState {
  // Core state
  isAuthenticated: boolean;
  user: FullUserData | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  
  // Session management
  setAuthenticated: (value: boolean) => void;
  setUser: (user: FullUserData | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetAuth: () => void;
  clear: () => void;
  clearError: () => void;
  
  // User data management
  updateUser: (data: Partial<FullUserData>) => void;
  refreshUserData: () => Promise<FullUserData | null>;
  
  // Auth operations
  login: (email: string, password: string) => Promise<boolean>;
  logIn: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  
  // Password operations
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  
  // User registration
  register: (userData: any) => Promise<any>;
  createUser: (userData: any) => Promise<{ data: any; error: any }>;
  signup: (email: string, password: string, options?: any) => Promise<{ user: any; error: any }>;
  
  // Profile operations
  updateProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  refreshProfile: () => Promise<FullUserData | null>;

  // Entity access helpers  
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasRegionAccess: (regionId: string) => boolean;
  hasSectorAccess: (sectorId: string) => boolean;
  hasSchoolAccess: (schoolId: string) => boolean;
}

// Helper to fetch user data from Supabase
const fetchUserData = async (userId: string): Promise<FullUserData | null> => {
  try {
    console.log('[useAuthStore] Fetching user data for:', userId);
    
    // First try to get user role data from user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, region_id, sector_id, school_id')
      .eq('user_id', userId)
      .single();
    
    if (roleError) {
      console.error('[useAuthStore] Error fetching role data:', roleError);
      // Don't throw error here, continue with profile data
    }
    
    // Fetch basic profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('[useAuthStore] Error fetching profile:', profileError);
      return null;
    }
    
    // Get user email from auth.users if available
    const { data: authUserData } = await supabase.auth.getUser(userId);
    const userEmail = authUserData?.user?.email || profile?.email;
    
    // Combine data into FullUserData
    let userData: FullUserData = {
      id: userId,
      email: userEmail || '',
      role: (roleData?.role as UserRole) || profile?.role as UserRole || 'user',
      region_id: roleData?.region_id || profile?.region_id || null,
      sector_id: roleData?.sector_id || profile?.sector_id || null,
      school_id: roleData?.school_id || profile?.school_id || null,
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      position: profile?.position || '',
      language: profile?.language || 'az',
      status: profile?.status || 'active',
      avatar: profile?.avatar || '',
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: profile?.updated_at || new Date().toISOString(),
      last_login: profile?.last_login || null,
      regionId: roleData?.region_id || profile?.region_id || null,
      sectorId: roleData?.sector_id || profile?.sector_id || null,
      schoolId: roleData?.school_id || profile?.school_id || null,
    };
    
    console.log('[useAuthStore] User data fetched successfully:', userData);
    return userData;
  } catch (error) {
    console.error('[useAuthStore] Error in fetchUserData:', error);
    return null;
  }
};

// Function that merges partial user data with existing user data
const mergeUserData = (
  existingUser: FullUserData | null, 
  newData: Partial<FullUserData>
): FullUserData | null => {
  if (!existingUser) return null;
  return {
    ...existingUser,
    ...newData,
  };
};

// Create the enhanced auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Core state
      isAuthenticated: false,
      user: null,
      session: null,
      isLoading: true,
      error: null,
      
      // State setters
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // State reset functions
      clear: () => set({ isAuthenticated: false, user: null, session: null, error: null }),
      resetAuth: () => set({ 
        isAuthenticated: false, 
        user: null, 
        session: null, 
        error: null, 
        isLoading: false
      }),
      clearError: () => set({ error: null }),
      
      // User data management
      updateUser: (data) => 
        set((state) => ({ 
          user: mergeUserData(state.user, data) 
        })),
        
      refreshUserData: async () => {
        const { session } = get();
        
        if (!session?.user?.id) {
          console.warn('[useAuthStore] Cannot refresh user data without a session');
          return null;
        }
        
        set({ isLoading: true });
        
        try {
          const userData = await fetchUserData(session.user.id);
          
          if (userData) {
            set({ 
              user: userData,
              isAuthenticated: true,
              isLoading: false 
            });
            return userData;
          }
          
          set({ isLoading: false });
          return null;
        } catch (error) {
          console.error('[useAuthStore] Error refreshing user data:', error);
          set({ isLoading: false });
          return null;
        }
      },
      
      // Auth operations
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Validate inputs
          if (!email.trim() || !password.trim()) {
            set({ 
              error: 'Email və şifrə daxil edilməlidir',
              isLoading: false
            });
            return false;
          }
          
          // Attempt login
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            console.error('[useAuthStore] Login error:', error);
            
            // User-friendly error messages
            if (error.message?.includes('Invalid login credentials')) {
              set({ error: 'Yanlış email və ya şifrə', isLoading: false });
            } else if (error.message?.includes('Email not confirmed')) {
              set({ error: 'Email təsdiqlənməyib', isLoading: false });
            } else {
              set({ error: error.message || 'Giriş zamanı xəta baş verdi', isLoading: false });
            }
            
            return false;
          }
          
          // If login successful, update session
          if (data.session) {
            set({ 
              session: data.session,
              isLoading: true  // Keep loading while we fetch user data
            });
            
            // Fetch user data
            if (data.session.user?.id) {
              const userData = await fetchUserData(data.session.user.id);
              
              if (userData) {
                console.log('[useAuthStore] Login successful, setting user data:', userData);
                set({
                  user: userData,
                  isAuthenticated: true,
                  isLoading: false
                });
              } else {
                console.error('[useAuthStore] Login successful but failed to get user data');
                set({ isLoading: false });
              }
            } else {
              set({ isLoading: false });
            }
            
            return true;
          }
          
          set({ isLoading: false });
          return false;
        } catch (error: any) {
          console.error('[useAuthStore] Unexpected login error:', error);
          set({ 
            error: error.message || 'Gözlənilməz xəta baş verdi', 
            isLoading: false
          });
          return false;
        }
      },
      
      // Legacy login method (alias)
      logIn: async (email, password) => {
        const success = await get().login(email, password);
        if (success) {
          return { data: get().user, error: null };
        } else {
          return { data: null, error: get().error };
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
          set({ 
            isAuthenticated: false, 
            user: null,
            session: null,
            isLoading: false
          });
          console.log('[useAuthStore] Logout successful');
        } catch (error: any) {
          console.error('[useAuthStore] Logout error:', error);
          set({ 
            error: error.message || 'Çıxış zamanı xəta baş verdi', 
            isLoading: false
          });
        }
      },
      
      // Alias for logout
      signOut: async () => {
        await get().logout();
      },
      
      refreshAuth: async () => {
        const { session } = get();
        
        if (!session) {
          // Try to get session
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            set({ session: data.session });
            await get().refreshUserData();
          }
        } else {
          await get().refreshUserData();
        }
      },
      
      refreshSession: async () => {
        set({ isLoading: true });
        try {
          console.log('[useAuthStore] Refreshing session...');
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('[useAuthStore] Session refresh error:', error);
            set({ isLoading: false });
            return;
          }
          
          set({ session: data.session });
          
          if (data.session?.user) {
            console.log('[useAuthStore] Session found, refreshing user data...');
            // We found a session, now fetch the user data
            const userData = await fetchUserData(data.session.user.id);
            
            if (userData) {
              console.log('[useAuthStore] User data refreshed successfully:', userData);
              set({
                user: userData,
                isAuthenticated: true,
                isLoading: false
              });
            } else {
              console.warn('[useAuthStore] No user data found after session refresh');
              set({ isLoading: false });
            }
          } else {
            console.log('[useAuthStore] No session found during refresh');
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('[useAuthStore] Session refresh exception:', error);
          set({ isLoading: false });
        }
      },
      
      // Password operations
      resetPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }
          
          set({ isLoading: false });
          return { data, error: null };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { data: null, error };
        }
      },
      
      updatePassword: async (newPassword) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.auth.updateUser({
            password: newPassword
          });
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }
          
          set({ isLoading: false });
          return { data, error: null };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { data: null, error };
        }
      },
      
      // User registration
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const { email, password, full_name, ...metadata } = userData;
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name,
                ...metadata
              }
            }
          });
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }
          
          set({ isLoading: false });
          return { data, error: null };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { data: null, error };
        }
      },
      
      createUser: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const result = await get().register(userData);
          set({ isLoading: false });
          return { data: result.data, error: result.error };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { data: null, error };
        }
      },
      
      signup: async (email, password, options = {}) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options
          });
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { user: null, error };
          }
          
          set({ isLoading: false });
          return { user: data.user, error: null };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { user: null, error };
        }
      },
      
      // Profile operations
      updateProfile: async (updates) => {
        const { user } = get();
        
        if (!user?.id) {
          return { data: null, error: new Error('No user authenticated') };
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Update profile in database
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
            
          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }
          
          // Update local user state
          set((state) => ({ 
            user: mergeUserData(state.user, updates),
            isLoading: false 
          }));
          
          return { data, error: null };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { data: null, error };
        }
      },
      
      refreshProfile: async () => {
        return await get().refreshUserData();
      },
      
      // Role and permission helpers
      hasRole: (role) => {
        const { user } = get();
        
        if (!user?.role) return false;
        
        if (Array.isArray(role)) {
          return role.includes(user.role as UserRole);
        }
        
        return user.role === role;
      },
      
      hasRegionAccess: (regionId) => {
        const { user } = get();
        
        if (!user) return false;
        
        // Super admin has access to everything
        if (user.role === 'superadmin') return true;
        
        // Region admins only have access to their region
        if (user.role === 'regionadmin') {
          return user.region_id === regionId;
        }
        
        return false;
      },
      
      hasSectorAccess: (sectorId) => {
        const { user } = get();
        
        if (!user) return false;
        
        // Super admin has access to everything
        if (user.role === 'superadmin') return true;
        
        // Sector admins only have access to their sector
        if (user.role === 'sectoradmin') {
          return user.sector_id === sectorId;
        }
        
        return false;
      },
      
      hasSchoolAccess: (schoolId) => {
        const { user } = get();
        
        if (!user) return false;
        
        // Super admin has access to everything
        if (user.role === 'superadmin') return true;
        
        // School admins only have access to their school
        if (user.role === 'schooladmin') {
          return user.school_id === schoolId;
        }
        
        return false;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Initialize auth session when the module loads
const initializeAuth = async () => {
  console.log('[useAuthStore] Initializing auth store');
  const { refreshSession } = useAuthStore.getState();
  await refreshSession();
};

// Call initialization immediately
initializeAuth().catch(error => {
  console.error('[useAuthStore] Error during initialization:', error);
});

// Create selectors for commonly used values
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUserRole = (state: AuthState): UserRole | null => {
  if (!state.user) return null;
  // Ensure role is a valid UserRole type
  const role = state.user.role as UserRole;
  if (['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'teacher', 'student', 'parent'].includes(role)) {
    return role;
  }
  return null;
};
export const selectRegionId = (state: AuthState) => state.user?.region_id;
export const selectSectorId = (state: AuthState) => state.user?.sector_id;
export const selectSchoolId = (state: AuthState) => state.user?.school_id;

// Helper functions
export const shouldAuthenticate = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  const isLoading = useAuthStore.getState().isLoading;
  return !isAuthenticated && !isLoading;
};

export const isProtectedRoute = (pathname: string) => {
  // Define protected routes
  const protectedRoutes = ['/dashboard', '/regions', '/sectors', '/schools', '/users', '/settings', '/profile'];
  
  // Check if the current path is protected
  return protectedRoutes.some(route => pathname.startsWith(route));
};

export const getRedirectPath = (pathname: string) => {
  return isProtectedRoute(pathname) ? '/login' : pathname;
};

export default useAuthStore;
