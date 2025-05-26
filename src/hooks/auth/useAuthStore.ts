import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserStatus, FullUserData, AuthState } from '@/types/auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  session: null,
  initialized: false,
  initializationAttempted: false,

  initializeAuth: async (loginOnly: boolean = false) => {
    const state = get();
    
    if (state.initialized && !loginOnly) {
      console.log('[useAuthStore] Auth already initialized');
      return;
    }
    
    set({ 
      isLoading: true, 
      error: null 
    });
    
    try {
      console.log('[useAuthStore] Initializing auth...');
      
      // İlk olaraq mövcud sessiyanı yoxla
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[useAuthStore] Session error:', sessionError);
        throw sessionError;
      }

      if (session?.user) {
        console.log('[useAuthStore] Session found, fetching user data...');
        set({ session });
        await get().fetchUser();
      } else {
        console.log('[useAuthStore] No session found');
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          session: null
        });
      }
      
      // Auth state listener quraşdır (yalnız bir dəfə)
      if (!state.initializationAttempted) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('[useAuthStore] Auth state change:', event);
          
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
            // Token yenilənəndə user məlumatını da yenilə
            await get().fetchUser();
          }
        });
        
        // Cleanup funksiyasını saxla
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
      console.error('[useAuthStore] Initialize auth error:', error);
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
      console.log('[useAuthStore] Starting signIn...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[useAuthStore] SignIn error:', error);
        throw error;
      }

      console.log('[useAuthStore] SignIn successful');
      // fetchUser auth state change listener tərəfindən çağırılacaq
      
    } catch (error: any) {
      console.error('[useAuthStore] SignIn failed:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    await get().signIn(email, password);
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      console.log('[useAuthStore] Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // State auth listener tərəfindən təmizlənəcək
      console.log('[useAuthStore] Sign out successful');
      
    } catch (error: any) {
      console.error('[useAuthStore] Sign out error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  logout: async () => {
    await get().signOut();
  },

  fetchUser: async () => {
    try {
      console.log('[useAuthStore] Fetching user...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('[useAuthStore] No session in fetchUser');
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          session: null
        });
        return;
      }

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
        console.error('[useAuthStore] Profile fetch error:', error);
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

        console.log('[useAuthStore] User data fetched successfully');
        set({ 
          user: fullUserData, 
          isAuthenticated: true, 
          isLoading: false,
          error: null
        });
      } else {
        // Profil yoxdursa, basic user məlumatları ilə davam et
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
      console.error('[useAuthStore] Fetch user error:', error);
      set({ 
        error: error.message, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false
      });
    }
  },

  updateUser: (userData: Partial<FullUserData>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },

  clearError: () => set({ error: null }),
}));

// Selector functions for easier usage
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectRegionId = (state: AuthState) => state.user?.region_id;
export const selectSectorId = (state: AuthState) => state.user?.sector_id;
export const selectSchoolId = (state: AuthState) => state.user?.school_id;

// Utility functions
export const shouldAuthenticate = (route: string) => {
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  return !publicRoutes.includes(route);
};

export const isProtectedRoute = (route: string) => {
  return shouldAuthenticate(route);
};

export const getRedirectPath = (userRole: UserRole) => {
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
