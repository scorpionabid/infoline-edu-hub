
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { securityLogger } from '@/utils/securityLogger';
import type { User, Session } from '@supabase/supabase-js';

// Extended User type with custom properties
export interface ExtendedUser extends User {
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  full_name?: string;
  position?: string;
  avatar?: string;
  preferences?: any;
}

export interface AuthState {
  user: ExtendedUser | null;
  session: Session | null;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: (loginOnly?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: (force?: boolean) => void;
  updateProfile: (updates: any) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  initialized: false,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      securityLogger.logAuthEvent('User signed in', { 
        userId: data.user?.id, 
        email: data.user?.email 
      });

      set({ 
        user: data.user as ExtendedUser, 
        session: data.session, 
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      securityLogger.logError('Sign in failed', { error: error.message });
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  signOut: async (loginOnly = false) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      securityLogger.logAuthEvent('User signed out');
      
      set({ 
        user: null, 
        session: null, 
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      securityLogger.logError('Sign out failed', { error: error.message });
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    const { signOut } = get();
    await signOut();
  },

  updateProfile: async (updates: any) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      set({ 
        user: { ...get().user, ...updates } as ExtendedUser,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  updatePassword: async (password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;

      set({ isLoading: false, error: null });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  initializeAuth: (force = false) => {
    if (get().initialized && !force) return;
    
    set({ isLoading: true, error: null });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ 
        user: session?.user as ExtendedUser ?? null, 
        session, 
        isLoading: false,
        initialized: true,
        error: null
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthStore] Auth state changed:', event, session?.user?.id);
        set({ 
          user: session?.user as ExtendedUser ?? null, 
          session,
          isLoading: false,
          error: null
        });
      }
    );

    return () => subscription.unsubscribe();
  },
}));

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectSession = (state: AuthState) => state.session;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsAuthenticated = (state: AuthState) => !!state.user;
export const selectSignOut = (state: AuthState) => state.signOut;
export const selectSignIn = (state: AuthState) => state.signIn;
export const selectInitializeAuth = (state: AuthState) => state.initializeAuth;
export const selectError = (state: AuthState) => state.error;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectRegionId = (state: AuthState) => state.user?.region_id || state.user?.regionId;
export const selectSectorId = (state: AuthState) => state.user?.sector_id || state.user?.sectorId;
export const selectSchoolId = (state: AuthState) => state.user?.school_id || state.user?.schoolId;
export const selectUpdateProfile = (state: AuthState) => state.updateProfile;
export const selectUpdatePassword = (state: AuthState) => state.updatePassword;
export const selectHasPermission = (state: AuthState) => (permission: string) => {
  // Basic permission check implementation
  return !!state.user;
};
