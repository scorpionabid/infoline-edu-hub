
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, FullUserData } from '@/types/auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  session: null,
  initialized: false,
  initializationAttempted: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🔐 [Auth] Attempting sign in', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      const userData: FullUserData = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        name: profile.full_name,
        role: profile.role,
        region_id: profile.region_id,
        sector_id: profile.sector_id,
        school_id: profile.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language,
        avatar: profile.avatar,
        status: profile.status,
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      set({
        user: userData,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      console.log('✅ [Auth] Sign in successful', { userId: userData.id, role: userData.role });
    } catch (error: any) {
      console.error('❌ [Auth] Sign in failed', { error: error.message });
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });

      console.log('🔓 [Auth] Sign out successful');
    } catch (error: any) {
      console.error('❌ [Auth] Sign out failed', { error: error.message });
      set({ isLoading: false, error: error.message });
    }
  },

  logout: async () => {
    await get().signOut();
  },

  login: async (email: string, password: string) => {
    await get().signIn(email, password);
  },

  fetchUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      const userData: FullUserData = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        name: profile.full_name,
        role: profile.role,
        region_id: profile.region_id,
        sector_id: profile.sector_id,
        school_id: profile.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language,
        avatar: profile.avatar,
        status: profile.status,
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      set({ user: userData });
    }
  },

  updateUser: (userData: Partial<FullUserData>) => {
    set(state => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: async (loginOnly = false): Promise<void> => {
    const state = get();
    
    if (state.initializationAttempted && !loginOnly) {
      return;
    }

    set({ isLoading: true, initializationAttempted: true });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const userData: FullUserData = {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            name: profile.full_name,
            role: profile.role,
            region_id: profile.region_id,
            sector_id: profile.sector_id,
            school_id: profile.school_id,
            phone: profile.phone,
            position: profile.position,
            language: profile.language,
            avatar: profile.avatar,
            status: profile.status,
            last_login: profile.last_login,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          };

          set({
            user: userData,
            session,
            isAuthenticated: true,
            isLoading: false,
            initialized: true
          });
        }
      } else {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true
        });
      }
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
        initialized: true
      });
    }
  },

  updateProfile: async (updates: Partial<FullUserData>) => {
    try {
      const state = get();
      if (!state.user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) throw error;

      set(state => ({
        user: state.user ? { ...state.user, ...updates } : null
      }));

      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  },

  hasPermission: (permission: string) => {
    const state = get();
    // Basic permission check based on role
    const user = state.user;
    if (!user) return false;
    
    if (user.role === 'superadmin') return true;
    // Add more permission logic as needed
    return false;
  }
}));

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectRegionId = (state: AuthState) => state.user?.region_id;
export const selectSectorId = (state: AuthState) => state.user?.sector_id;
export const selectSchoolId = (state: AuthState) => state.user?.school_id;
export const selectUpdateProfile = (state: AuthState) => state.updateProfile;
export const selectUpdatePassword = (state: AuthState) => state.updatePassword;
export const selectHasPermission = (state: AuthState) => state.hasPermission;
export const selectSignOut = (state: AuthState) => state.signOut;

// Helper functions
export const shouldAuthenticate = (route: string): boolean => {
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  return !publicRoutes.includes(route);
};

export const isProtectedRoute = (route: string): boolean => {
  return shouldAuthenticate(route);
};

export const getRedirectPath = (userRole: string): string => {
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
