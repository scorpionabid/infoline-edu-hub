
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { securityLogger } from '@/utils/securityLogger';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: (loginOnly?: boolean) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  initialized: false,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
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
        user: data.user, 
        session: data.session, 
        isLoading: false 
      });
    } catch (error) {
      securityLogger.logError('Sign in failed', { error: error.message });
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async (loginOnly = false) => {
    try {
      set({ isLoading: true });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      securityLogger.logAuthEvent('User signed out');
      
      set({ 
        user: null, 
        session: null, 
        isLoading: false 
      });
    } catch (error) {
      securityLogger.logError('Sign out failed', { error: error.message });
      set({ isLoading: false });
      throw error;
    }
  },

  initializeAuth: () => {
    if (get().initialized) return;
    
    set({ isLoading: true });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ 
        user: session?.user ?? null, 
        session, 
        isLoading: false,
        initialized: true 
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthStore] Auth state changed:', event, session?.user?.id);
        set({ 
          user: session?.user ?? null, 
          session,
          isLoading: false 
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
