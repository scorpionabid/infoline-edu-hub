
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserStatus, FullUserData, AuthState } from '@/types/auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  session: null,

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      await get().fetchUser();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await get().fetchUser();
      }
    } catch (error: any) {
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
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false, session: null });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  logout: async () => {
    await get().signOut();
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        set({ user: null, isAuthenticated: false, isLoading: false, session: null });
        return;
      }

      set({ session });

      // Fetch user profile with role information
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

      if (error) throw error;

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

        set({ 
          user: fullUserData, 
          isAuthenticated: true, 
          isLoading: false 
        });
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      set({ 
        error: error.message, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        session: null
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
