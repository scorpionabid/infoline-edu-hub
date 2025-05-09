
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

// Helper to fetch user data from Supabase
const fetchUserData = async (userId: string): Promise<FullUserData | null> => {
  try {
    // Fetch basic profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    if (!profile) return null;
    
    // Get entity names if necessary
    let userData: FullUserData = {...profile} as FullUserData;
    
    // If user has a region, sector or school ID, fetch their names
    if (userData.region_id) {
      const { data: region } = await supabase
        .from('regions')
        .select('name')
        .eq('id', userData.region_id)
        .single();
      
      if (region) {
        userData.region_name = region.name;
      }
    }
    
    if (userData.sector_id) {
      const { data: sector } = await supabase
        .from('sectors')
        .select('name')
        .eq('id', userData.sector_id)
        .single();
      
      if (sector) {
        userData.sector_name = sector.name;
      }
    }
    
    if (userData.school_id) {
      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', userData.school_id)
        .single();
      
      if (school) {
        userData.school_name = school.name;
      }
    }
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
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
          console.warn('Cannot refresh user data without a session');
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
          console.error('Error refreshing user data:', error);
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
            console.error('Login error:', error);
            
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
                set({
                  user: userData,
                  isAuthenticated: true,
                  isLoading: false
                });
              } else {
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
          console.error('Unexpected login error:', error);
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
          console.log('Logout successful');
        } catch (error: any) {
          console.error('Logout error:', error);
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
        try {
          const { data } = await supabase.auth.getSession();
          set({ session: data.session });
          
          if (data.session?.user) {
            await get().refreshUserData();
          }
        } catch (error) {
          console.error('Session refresh error:', error);
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
          
          // Extract fields from userData
          const { email, password, full_name, ...metadata } = userData;
          
          // Sign up the user
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
          
          // Implementation depends on specific app needs
          // This is just a placeholder
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
  const { setSession, setLoading, refreshUserData } = useAuthStore.getState();
  
  try {
    // Get current session
    const { data } = await supabase.auth.getSession();
    
    // Set session
    if (data.session) {
      setSession(data.session);
      
      // Fetch user data
      await refreshUserData();
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  } finally {
    setLoading(false);
  }
  
  // Set up auth listener
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    // Update session
    setSession(session);
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // We'll fetch user data on next tick to avoid potential deadlocks
      setTimeout(() => {
        refreshUserData();
      }, 0);
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.getState().resetAuth();
    }
  });
};

// Initialize auth
initializeAuth();

// Helpers for specific state selections to improve render performance
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectRegionId = (state: AuthState) => state.user?.region_id;
export const selectSectorId = (state: AuthState) => state.user?.sector_id;
export const selectSchoolId = (state: AuthState) => state.user?.school_id;

// Helper to determine if user needs to authenticate
export const shouldAuthenticate = (currentPath = '', isLoading = false, isAuthenticated = false): boolean => {
  // If still loading, don't redirect
  if (isLoading) return false;
  
  // Already authenticated, don't need to redirect to login
  if (isAuthenticated) return false;
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/reset-password', '/auth'];
  const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
  
  // Return true if we're not on a public path and not authenticated
  return !isPublicPath;
};

// Helper to check if path is a protected route
export const isProtectedRoute = (path: string): boolean => {
  const publicPaths = ['/login', '/register', '/reset-password', '/auth'];
  return !publicPaths.some(publicPath => path.startsWith(publicPath));
};

// Helper to get the redirect path after login
export const getRedirectPath = (role: string = 'user'): string => {
  switch (role) {
    case 'superadmin':
      return '/dashboard';
    case 'regionadmin':
      return '/dashboard';
    case 'sectoradmin':
      return '/dashboard';
    case 'schooladmin':
      return '/dashboard';
    default:
      return '/';
  }
};

export default useAuthStore;
