
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/supabase';

export interface AuthState {
  user: UserWithRole | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  refreshSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
}

interface UserWithRole {
  id: string;
  email?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  [key: string]: any;
}

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => !!state.session;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectRegionId = (state: AuthState) => state.user?.region_id;
export const selectSectorId = (state: AuthState) => state.user?.sector_id;
export const selectSchoolId = (state: AuthState) => state.user?.school_id;

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  initialized: false,

  refreshSession: async () => {
    console.log('[useAuthStore] Refreshing session...');
    set({ isLoading: true });
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (!session) {
        console.log('[useAuthStore] No session found during refresh');
        set({ session: null, user: null, isLoading: false, initialized: true });
        return;
      }

      // Get user role from user_roles table
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', session.user.id)
        .single();

      if (userRoleError && userRoleError.code !== 'PGRST116') {
        console.error('[useAuthStore] Error fetching user role:', userRoleError);
      }

      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[useAuthStore] Error fetching user profile:', profileError);
      }

      // Combine user data
      const userData: UserWithRole = {
        id: session.user.id,
        email: session.user.email,
        ...profileData,
        ...userRoleData
      };

      set({
        session,
        user: userData,
        isLoading: false,
        error: null,
        initialized: true
      });
      
      console.log('[useAuthStore] Session refreshed:', userData);
    } catch (error: any) {
      console.error('[useAuthStore] Error refreshing session:', error);
      set({
        session: null,
        user: null,
        isLoading: false,
        error: error.message,
        initialized: true
      });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, message: error.message };
      }
      
      await get().refreshSession();
      
      return { success: true, message: 'Successful login' };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, message: error.message };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message
      });
    }
  }
}));

// Helper function to check if authentication is required
export const shouldAuthenticate = (): boolean => {
  const { session, initialized } = useAuthStore.getState();
  return initialized && !session;
};

// Helper function to check if a route is protected
export const isProtectedRoute = (path: string): boolean => {
  const protectedRoutes = [
    '/dashboard',
    '/regions',
    '/sectors',
    '/schools',
    '/categories',
    '/columns',
    '/users',
    '/reports',
    '/settings',
    '/profile',
    '/data-entry',
    '/approvals'
  ];
  
  return protectedRoutes.some(route => path.startsWith(route));
};

// Get redirect path based on user role
export const getRedirectPath = (role?: UserRole): string => {
  if (!role) return '/login';
  
  switch (role) {
    case 'superadmin':
    case 'regionadmin':
    case 'sectoradmin':
    case 'schooladmin':
      return '/dashboard';
    default:
      return '/login';
  }
};
