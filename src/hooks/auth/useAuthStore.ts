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
            await get().fetchUser();
          }
        });
        
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
    // Create an AbortController to cancel any pending requests
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 8000); // 8-second timeout

    set({ isLoading: true });
    try {
      console.log('[useAuthStore] Preparing to sign out...');
      
      // First clear the local state to prevent UI from using stale data
      set({ 
        error: null,
        isAuthenticated: false
      });

      // Wait a small amount of time to allow UI state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[useAuthStore] Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // After successful signOut from Supabase, clear all local state
      set({ 
        user: null, 
        isAuthenticated: false, 
        session: null,
        error: null 
      });
      
      console.log('[useAuthStore] Session cleared successfully');
      
      // Clear any cached data in localStorage
      try {
        // Clear any app-specific cached data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('app-cache-') || key.startsWith('infoline-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('[useAuthStore] Error clearing localStorage:', e);
      }
      
      // Wait for state updates to propagate before redirecting
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Now that cleanup is complete, set loading to false and redirect
      set({ isLoading: false });
      console.log('[useAuthStore] Sign out successful, redirecting...');
      
      // Use replace instead of setting href to avoid history issues
      window.location.replace('/login');
      
    } catch (error: any) {
      console.error('[useAuthStore] Sign out error:', error);
      set({ 
        error: error.message, 
        isLoading: false 
      });
      
      // If there was an error, still try to redirect to login
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }, 500);
    } finally {
      // Clean up the timeout
      clearTimeout(timeoutId);
    }
    
    // Safety timeout as a fallback to ensure isLoading is set to false
    // and the user is redirected if the main flow fails
    setTimeout(() => {
      const state = get();
      if (state.isLoading) {
        console.warn('[useAuthStore] Force resetting loading state after timeout');
        set({ isLoading: false });
        
        // Force redirect if still on protected page
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
    }, 5000);
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
