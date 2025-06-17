// ============================================================================
// İnfoLine Unified Auth Store - FIXED VERSION
// ============================================================================
// Bu fayl logout problemini həll edir:
// 1. Event listener duplicasyon problema
// 2. State race condition problemi
// 3. Proper cleanup mechanism

import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserStatus, FullUserData, AuthState } from '@/types/auth';

// Global subscription reference to prevent duplicates
let globalAuthSubscription: any = null;

// ============================================================================
// Zustand Auth Store - Main State Management (FIXED)
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
      
      // FIXED: Auth state change listener - yalnız bir dəfə qur və global saxla
      if (!globalAuthSubscription && !state.initializationAttempted) {
        console.log('[AuthStore] Setting up auth state listener...');
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('[AuthStore] Auth state change:', event);
          
          if (event === 'SIGNED_IN' && currentSession) {
            set({ session: currentSession });
            await get().fetchUser();
          } else if (event === 'SIGNED_OUT') {
            console.log('[AuthStore] SIGNED_OUT event received - clearing state');
            set({ 
              user: null, 
              isAuthenticated: false, 
              session: null,
              error: null,
              isLoading: false
            });
          } else if (event === 'TOKEN_REFRESHED' && currentSession) {
            set({ session: currentSession });
            await get().fetchUser();
          }
        });
        
        globalAuthSubscription = subscription;
        
        // FIXED: Proper cleanup on window unload
        const cleanup = () => {
          if (globalAuthSubscription) {
            globalAuthSubscription.unsubscribe();
            globalAuthSubscription = null;
          }
        };
        
        window.addEventListener('beforeunload', cleanup);
        window.addEventListener('unload', cleanup);
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
        set({ isLoading: false });
        throw error;
      }

      console.log('[AuthStore] SignIn successful');
      
      // CRITICAL FIX: Fetch user immediately and update state
      if (data.session?.user) {
        set({ session: data.session });
        await get().fetchUser();
      }
      
    } catch (error: any) {
      console.error('[AuthStore] SignIn failed:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    console.log('[AuthStore] Starting sign out...');
    
    try {
      // CRITICAL FIX: State-i İLK öncə təmizlə ki, ProtectedRoute dərhal cavab versin
      console.log('[AuthStore] Clearing local state FIRST...');
      set({ 
        user: null, 
        isAuthenticated: false, 
        session: null,
        error: null,
        isLoading: false,
        // Re-initialization üçün flag-ları sıfırla
        initialized: false,
        initializationAttempted: false
      });
      
      // CRITICAL FIX: Cache və localStorage-ı dərhal təmizlə
      try {
        // Supabase auth key-ləri təmizlə
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('supabase') || 
            key.startsWith('app-cache-') || 
            key.startsWith('infoline-') ||
            key.includes('auth')
          )) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Session storage da təmizlə
        sessionStorage.clear();
        
        console.log('[AuthStore] Storage cleared successfully');
      } catch (e) {
        console.warn('[AuthStore] Error clearing storage (non-critical):', e);
      }
      
      // CRITICAL FIX: İndi Supabase signOut-u çağır (background-da)
      console.log('[AuthStore] Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('[AuthStore] Supabase signOut error (non-critical since state already cleared):', error);
        // State artıq təmizlənib, Supabase xətası kritik deyil
      }
      
      console.log('[AuthStore] Sign out completed successfully');
      
      // CRITICAL FIX: Dərhal redirect et
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        console.log('[AuthStore] Redirecting to login...');
        window.location.replace('/login');
      }
      
    } catch (error: any) {
      console.error('[AuthStore] Sign out error:', error);
      
      // CRITICAL FIX: Xəta halında da state təmizlənsin (əgər hələ təmizlənməyibsə)
      set({ 
        user: null, 
        isAuthenticated: false, 
        session: null,
        error: null,
        isLoading: false,
        initialized: false,
        initializationAttempted: false
      });
      
      // CRITICAL FIX: Xəta halında da login səhifəsinə yönləndir
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
      
      throw error; // Xətanı rethrow et ki, UI-da handle edilsin
    }
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
        
        console.log('[AuthStore] Using fallback user data');
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
// Cleanup function for global subscription
// ============================================================================
export const cleanupAuthSubscription = () => {
  if (globalAuthSubscription) {
    globalAuthSubscription.unsubscribe();
    globalAuthSubscription = null;
  }
};

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