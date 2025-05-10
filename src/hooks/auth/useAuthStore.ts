
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session, AuthChangeEvent, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserData } from './authActions';
import { UserRole, FullUserData } from '@/types/supabase';

interface AuthState {
  session: Session | null;
  user: FullUserData | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  setSession: (session: Session | null) => void;
  setUserData: (userData: FullUserData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetAuth: () => void;
  
  // Authentication operations
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  forceSessionReset: () => Promise<void>;
  
  // Additional methods for compatibility
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  updatePassword: (password: string) => Promise<any>;
  updateProfile: (data: Partial<FullUserData>) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  register: (email: string, password: string, metadata?: any) => Promise<any>;
  signup: (email: string, password: string, metadata?: any) => Promise<any>;
  updateUser: (data: Partial<FullUserData>) => Promise<any>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      user: null,
      isAuthenticated: false,
      userRole: null,
      regionId: null,
      sectorId: null,
      schoolId: null,
      isLoading: true,
      error: null,
      
      // State setters
      setSession: (session) => set(() => ({ 
        session,
        isAuthenticated: !!session,
      })),
      
      setUserData: (userData) => set(() => ({ 
        user: userData,
        userRole: userData?.role as UserRole || null,
        regionId: userData?.region_id || null,
        sectorId: userData?.sector_id || null,
        schoolId: userData?.school_id || null,
      })),
      
      setLoading: (isLoading) => set(() => ({ isLoading })),
      
      setError: (error) => set(() => ({ error })),
      
      resetAuth: () => set(() => ({ 
        session: null,
        user: null,
        isAuthenticated: false,
        userRole: null,
        regionId: null,
        sectorId: null,
        schoolId: null,
        error: null,
      })),
      
      // Authentication methods
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            set({ 
              error: error.message,
              isLoading: false,
            });
            return false;
          }
          
          set({ 
            session: data.session,
            isAuthenticated: true,
            isLoading: true,
          });
          
          // Fetch user data after login
          if (data.session) {
            const userData = await fetchUserData(data.session.user.id);
            
            if (userData) {
              set({ 
                user: userData,
                userRole: userData.role as UserRole || null,
                regionId: userData.region_id || null,
                sectorId: userData.sector_id || null,
                schoolId: userData.school_id || null,
              });
            }
          }
          
          set({ isLoading: false });
          return true;
          
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed',
            isLoading: false,
          });
          return false;
        }
      },
      
      logout: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            set({ 
              error: error.message,
              isLoading: false,
            });
            return;
          }
          
          // Reset all auth state
          get().resetAuth();
          set({ isLoading: false });
          
        } catch (error: any) {
          set({ 
            error: error.message || 'Logout failed',
            isLoading: false,
          });
        }
      },
      
      refreshSession: async () => {
        console.log("[useAuthStore] Refreshing session...");
        
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error refreshing session:", error);
            set({ 
              error: error.message,
              isLoading: false,
              session: null,
              isAuthenticated: false,
            });
            return;
          }
          
          if (!data.session) {
            console.info("[useAuthStore] No session found during refresh");
            set({ 
              session: null,
              user: null,
              isAuthenticated: false,
              userRole: null,
              regionId: null,
              sectorId: null,
              schoolId: null,
              isLoading: false,
            });
            return;
          }
          
          // We have a session, set it and fetch user data
          set({ 
            session: data.session,
            isAuthenticated: true,
          });
          
          // Fetch user profile data 
          await get().refreshUserData();
          
        } catch (error: any) {
          console.error("Unexpected error refreshing session:", error);
          set({ 
            error: error.message || 'Failed to refresh session',
            isLoading: false,
          });
        }
      },
      
      refreshUserData: async () => {
        const session = get().session;
        
        if (!session?.user?.id) {
          console.warn("Cannot refresh user data without a valid session");
          set({ isLoading: false });
          return;
        }
        
        try {
          set({ isLoading: true });
          const userData = await fetchUserData(session.user.id);
          
          if (userData) {
            set({ 
              user: userData,
              userRole: userData.role as UserRole || null,
              regionId: userData.region_id || null,
              sectorId: userData.sector_id || null,
              schoolId: userData.school_id || null,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          console.error("Error refreshing user data:", error);
          set({ 
            error: error.message || 'Failed to refresh user data',
            isLoading: false,
          });
        }
      },
      
      forceSessionReset: async () => {
        console.warn("[useAuthStore] Forcing session reset due to invalid JWT");
        
        try {
          // Clear Supabase session
          await supabase.auth.signOut();
          
          // Clear local storage and session storage
          localStorage.clear();
          sessionStorage.clear();
          
          // Reset entire auth state
          set({
            session: null,
            user: null,
            isAuthenticated: false,
            userRole: null,
            regionId: null,
            sectorId: null,
            schoolId: null,
            isLoading: false,
            error: 'Session invalidated. Please log in again.'
          });
        } catch (error) {
          console.error("Error during force session reset:", error);
        }
      },

      // Additional methods for compatibility
      clearError: () => set({ error: null }),
      
      refreshProfile: async () => {
        await get().refreshUserData();
      },
      
      updatePassword: async (password) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.updateUser({
            password
          });
          
          if (error) throw error;
          
          set({ isLoading: false });
          return { data, error: null };
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          return { data: null, error };
        }
      },
      
      updateProfile: async (userData) => {
        try {
          set({ isLoading: true });
          // Update auth user metadata
          if (userData.full_name) {
            await supabase.auth.updateUser({
              data: { full_name: userData.full_name }
            });
          }
          
          // Update profile in database
          const { data, error } = await supabase
            .from('profiles')
            .update({
              full_name: userData.full_name,
              phone: userData.phone,
              position: userData.position,
              language: userData.language,
              status: userData.status,
            })
            .eq('id', userData.id || get().user?.id || '')
            .select();
          
          if (error) throw error;
          
          // Refresh user data to get updated profile
          await get().refreshUserData();
          
          set({ isLoading: false });
          return { data, error: null };
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          return { data: null, error };
        }
      },
      
      resetPassword: async (email) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.resetPasswordForEmail(email);
          
          if (error) throw error;
          
          set({ isLoading: false });
          return { data, error: null };
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          return { data: null, error };
        }
      },
      
      register: async (email, password, metadata = {}) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata
            }
          });
          
          if (error) throw error;
          
          set({ isLoading: false });
          return { data, error: null };
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          return { data: null, error };
        }
      },
      
      // Alias for register
      signup: async (email, password, metadata = {}) => {
        return get().register(email, password, metadata);
      },
      
      // Alias for updateProfile
      updateUser: async (userData) => {
        return get().updateProfile(userData);
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        session: state.session,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        regionId: state.regionId,
        sectorId: state.sectorId,
        schoolId: state.schoolId,
      }),
    }
  )
);

// Selector functions for better performance
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUser = (state: AuthState) => state.user;
export const selectUserRole = (state: AuthState) => state.userRole;
export const selectRegionId = (state: AuthState) => state.regionId;
export const selectSectorId = (state: AuthState) => state.sectorId;
export const selectSchoolId = (state: AuthState) => state.schoolId;

// Helper functions
export const shouldAuthenticate = (isAuthenticated: boolean, isLoading: boolean): boolean => {
  return !isAuthenticated && !isLoading;
};

export const isProtectedRoute = (pathname: string): boolean => {
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  return !publicRoutes.some(route => pathname.startsWith(route));
};

export const getRedirectPath = (pathname: string): string => {
  return pathname === "/" ? "/dashboard" : pathname;
};
