
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, FullUserData } from '@/types/auth';
import { toast } from 'sonner';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      session: null,
      initialized: false,
      initializationAttempted: false,

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
            set({ isAuthenticated: true, session: data.session });
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            session: null,
            error: null,
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await get().signOut();
      },

      login: async (email: string, password: string) => {
        await get().signIn(email, password);
      },

      fetchUser: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.user) {
            set({ user: null, isAuthenticated: false });
            return;
          }

          // Fetch user profile and role data
          const [profileResponse, roleResponse] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', session.user.id).single(),
            supabase.from('user_roles').select('*').eq('user_id', session.user.id).single()
          ]);

          const profile = profileResponse.data;
          const role = roleResponse.data;

          if (profile && role) {
            const userData: FullUserData = {
              id: session.user.id,
              email: session.user.email || profile.email || '',
              full_name: profile.full_name,
              name: profile.full_name,
              role: role.role,
              region_id: role.region_id,
              regionId: role.region_id,
              sector_id: role.sector_id,
              sectorId: role.sector_id,
              school_id: role.school_id,
              schoolId: role.school_id,
              phone: profile.phone,
              position: profile.position,
              language: profile.language || 'az',
              avatar: profile.avatar,
              status: profile.status || 'active',
              last_login: profile.last_login,
              lastLogin: profile.last_login,
              created_at: profile.created_at,
              createdAt: profile.created_at,
              updated_at: profile.updated_at,
              updatedAt: profile.updated_at,
            };

            set({ user: userData, isAuthenticated: true, session });
          }
        } catch (error: any) {
          console.error('Error fetching user:', error);
          set({ error: error.message });
        }
      },

      updateUser: (userData: Partial<FullUserData>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: async (loginOnly = false) => {
        if (get().initializationAttempted && !loginOnly) return;
        
        set({ isLoading: true, initializationAttempted: true });
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            await get().fetchUser();
          } else {
            set({ user: null, isAuthenticated: false, session: null });
          }
          
          set({ initialized: true });
        } catch (error: any) {
          console.error('Auth initialization error:', error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (updates: Partial<FullUserData>) => {
        try {
          const user = get().user;
          if (!user) throw new Error('No user found');

          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

          if (error) throw error;

          get().updateUser(updates);
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
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
          return { success: false, error: error.message };
        }
      },

      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user || !user.permissions) return false;
        
        // Convert permissions object to array for checking
        const permissionKeys = Object.keys(user.permissions);
        return permissionKeys.includes(permission);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        session: state.session,
      }),
    }
  )
);

// Selector functions
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
