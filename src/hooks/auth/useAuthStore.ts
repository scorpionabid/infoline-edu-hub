
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/auth';

export interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  isAuthenticated: boolean;
  setUser: (user: FullUserData | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearErrors: () => void;
  initializeAuth: () => Promise<void>;
  updateUser: (userData: Partial<FullUserData>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  initialized: false,
  isAuthenticated: false,
  
  setUser: (user) => set((state) => ({
    ...state,
    user,
    isAuthenticated: !!user
  })),
  
  setSession: (session) => set((state) => ({
    ...state,
    session,
    isAuthenticated: !!session
  })),
  
  setLoading: (loading) => set((state) => ({
    ...state,
    loading
  })),
  
  setError: (error) => set((state) => ({
    ...state,
    error
  })),
  
  clearErrors: () => set((state) => ({
    ...state,
    error: null
  })),
  
  updateUser: (userData) => set((state) => ({
    ...state,
    user: state.user ? { ...state.user, ...userData } : null
  })),

  initializeAuth: async () => {
    set({ loading: true });

    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, isAuthenticated: !!session });

      // If we have a session, load the user profile
      if (session) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user profile:', userError);
          set({ error: userError.message });
        } else {
          set({ user: userData as FullUserData });
        }
      }

      // Set up auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          set({ session, isAuthenticated: !!session });

          if (session) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) {
              console.error('Error fetching user profile:', userError);
              set({ error: userError.message });
            } else {
              set({ user: userData as FullUserData });
            }
          } else {
            set({ user: null });
          }
        }
      );

      // Cleanup function (not used in initialization but for completeness)
      return () => {
        subscription.unsubscribe();
      };
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false, initialized: true });
    }
  }
}));

export default useAuthStore;
