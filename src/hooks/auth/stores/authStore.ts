// ============================================================================
// İnfoLine Unified Auth Store - Zustand State Management
// ============================================================================
// Bu fayl bütün auth state management-ı vahidləşdirir
// Əvvəlki useAuthStore.ts faylının yenilənmiş versiyası

import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserStatus, FullUserData, AuthState } from '@/types/auth';

// ============================================================================
// Zustand Auth Store - Main State Management
// ============================================================================

export const useAuthStore = create<AuthState>((set, get) => ({
  // ========== State ==========
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  session: null,
  initialized: false,
  initializationAttempted: false,

  // ========== Authentication Methods ==========
  
  initializeAuth: async (loginOnly: boolean = false) => {
    const state = get();
    
    if (state.initialized && !loginOnly) {
      console.log('[AuthStore] Auth already initialized');
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      console.log('[AuthStore] Initializing auth...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[AuthStore] Session error:', sessionError);
        throw sessionError;
      }

      if (session?.user) {
        console.log('[AuthStore] Session found, fetching user data...');
        set({ session });
        await get().fetchUser();
      } else {
        console.log('[AuthStore] No session found');
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          session: null
        });
      }
      
      // Auth state change listener - sadə dəfə qur
      if (!state.initializationAttempted) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('[AuthStore] Auth state change:', event);
          
          set({ session: currentSession });
          
          if (event === 'SIGNED_IN' && currentSession) {
            await get().fetchUser();
          } else if (event === 'SIGNED_OUT') {
            set({ 
              user: null, 
              isAuthenticated: false, 
              session: null,
              error: null
            });
          } else if (event === 'TOKEN_REFRESHED' && currentSession) {
            await get().fetchUser();
          }
        });
        
        // Cleanup on window unload
        window.addEventListener('beforeunload', () => {
          subscription.unsubscribe();
        });
      }
      
      set({ 
        initialized: true,
        initializationAttempted: true,
        isLoading: false
      });
      
    } catch (error: any) {
      console.error('[AuthStore] Initialize auth error:', error);
      set({ 
        error: error.message, 
        isLoading: false,
        initialized: true,
        initializationAttempted: true
      });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[AuthStore] Starting signIn...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthStore] SignIn error:', error);
        throw error;
      }

      console.log('[AuthStore] SignIn successful');
      
    } catch (error: any) {
      console.error('[AuthStore] SignIn failed:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 8000);

    set({ isLoading: true });
    try {
      console.log('[AuthStore] Starting sign out...');
      
      // Əvvəlcə lokal state-i təmizlə
      set({ 
        error: null,
        isAuthenticated: false
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[AuthStore] Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Bütün state-i təmizlə
      set({ 
        user: null, 
        isAuthenticated: false, 
        session: null,
        error: null 
      });
      
      console.log('[AuthStore] Session cleared successfully');
      
      // Cache təmizlə
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('app-cache-') || key.startsWith('infoline-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('[AuthStore] Error clearing localStorage:', e);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      set({ isLoading: false });
      console.log('[AuthStore] Sign out successful, redirecting...');
      
      window.location.replace('/login');
      
    } catch (error: any) {
      console.error('[AuthStore] Sign out error:', error);
      set({ 
        error: error.message, 
        isLoading: false 
      });
      
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }, 500);
    } finally {
      clearTimeout(timeoutId);
    }
    
    // Safety timeout
    setTimeout(() => {
      const state = get();
      if (state.isLoading) {
        console.warn('[AuthStore] Force resetting loading state after timeout');
        set({ isLoading: false });
        
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
    }, 5000);
  },

  fetchUser: async () => {
    try {
      console.log('[AuthStore] Fetching user...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('[AuthStore] No session in fetchUser');
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          session: null
        });
        return;
      }

      // Profil və rol məlumatları
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role,
            region_id,
            sector_id,
            school_id
          )
        `)
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[AuthStore] Profile fetch error:', error);
        throw error;
      }

      if (userProfile) {
        const role = userProfile.user_roles?.[0]?.role as UserRole || 'schooladmin' as UserRole;
        
        const fullUserData: FullUserData = {
          id: userProfile.id,
          email: userProfile.email || session.user.email || '',
          full_name: userProfile.full_name || '',
          name: userProfile.full_name || '',
          role,
          region_id: userProfile.user_roles?.[0]?.region_id,
          regionId: userProfile.user_roles?.[0]?.region_id,
          sector_id: userProfile.user_roles?.[0]?.sector_id,
          sectorId: userProfile.user_roles?.[0]?.sector_id,
          school_id: userProfile.user_roles?.[0]?.school_id,
          schoolId: userProfile.user_roles?.[0]?.school_id,
          phone: userProfile.phone,
          position: userProfile.position,
          language: userProfile.language,
          avatar: userProfile.avatar,
          status: userProfile.status as UserStatus || 'active' as UserStatus,
          created_at: userProfile.created_at,
          updated_at: userProfile.updated_at,
          createdAt: userProfile.created_at,
          updatedAt: userProfile.updated_at
        };

        console.log('[AuthStore] User data fetched successfully');
        set({ 
          user: fullUserData, 
          isAuthenticated: true, 
          isLoading: false,
          error: null
        });
      } else {
        // Fallback basic user data
        const basicUserData: FullUserData = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.email?.split('@')[0] || '',
          name: session.user.email?.split('@')[0] || '',
          role: 'schooladmin' as UserRole,
          status: 'active' as UserStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set({ 
          user: basicUserData, 
          isAuthenticated: true, 
          isLoading: false,
          error: null
        });
      }
    } catch (error: any) {
      console.error('[AuthStore] Fetch user error:', error);
      set({ 
        error: error.message, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false
      });
    }
  },

  // ========== Profile Management ==========

  updateProfile: async (updates: Partial<FullUserData>) => {
    set({ isLoading: true, error: null });
    try {
      if (updates.email) {
        const { data, error } = await supabase.auth.updateUser({
          email: updates.email
        });
        if (error) throw error;
      }

      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...updates } });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('[AuthStore] Update profile error:', error);
      set({ error: error as Error });
      return { success: false, error };
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('[AuthStore] Update password error:', error);
      set({ error: error as Error });
      return { success: false, error };
    } finally {
      set({ isLoading: false });
    }
  },

  // ========== Utility Methods ==========

  updateUser: (userData: Partial<FullUserData>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },

  clearError: () => set({ error: null }),

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  },

  // ========== Alias Methods for Backward Compatibility ==========
  login: async (email: string, password: string) => {
    await get().signIn(email, password);
  },

  logout: async () => {
    await get().signOut();
  }
}));

// ============================================================================
// Selector Functions for Optimized Access
// ============================================================================

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectRegionId = (state: AuthState) => state.user?.region_id;
export const selectSectorId = (state: AuthState) => state.user?.sector_id;
export const selectSchoolId = (state: AuthState) => state.user?.school_id;

// Method selectors
export const selectUpdateProfile = (state: AuthState) => state.updateProfile;
export const selectUpdatePassword = (state: AuthState) => state.updatePassword;
export const selectHasPermission = (state: AuthState) => state.hasPermission;
export const selectSignOut = (state: AuthState) => state.signOut;

// ============================================================================
// Utility Functions for Route Protection
// ============================================================================

export const shouldAuthenticate = (route: string): boolean => {
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  return !publicRoutes.includes(route);
};

export const isProtectedRoute = (route: string): boolean => {
  return shouldAuthenticate(route);
};

export const getRedirectPath = (userRole: UserRole): string => {
  switch (userRole) {
    case 'superadmin':
      return '/dashboard';
    case 'regionadmin':
      return '/dashboard';
    case 'sectoradmin':
      return '/dashboard';
    case 'schooladmin':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

// ============================================================================
// Export Default Store
// ============================================================================

export default useAuthStore;