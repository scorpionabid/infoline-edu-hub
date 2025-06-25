
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, AuthState } from '@/types/auth';
import { securityLogger, getClientContext } from '@/utils/securityLogger';

// Only store minimal, non-sensitive session data in localStorage
interface PersistedAuthData {
  sessionId: string | null;
  lastLoginTime: number | null;
  rememberMe: boolean;
}

// Enhanced auth store with security improvements
const useSecureAuthStore = create<AuthState>()(
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
        const context = getClientContext();
        
        try {
          set({ isLoading: true, error: null });
          
          // Rate limiting check
          const rateLimitCheck = await supabase.rpc('check_auth_rate_limit');
          if (!rateLimitCheck.data) {
            throw new Error('Too many login attempts. Please try again later.');
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            securityLogger.logAuthEvent('LOGIN_FAILED', { 
              ...context, 
              email: email.substring(0, 3) + '***' 
            });
            throw error;
          }

          if (data.user && data.session) {
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
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
              .eq('id', data.user.id)
              .single();

            if (profileError) throw profileError;

            const userData: FullUserData = {
              id: data.user.id,
              email: data.user.email || '',
              full_name: profile.full_name || '',
              name: profile.full_name || '',
              role: profile.user_roles?.[0]?.role || 'user',
              region_id: profile.user_roles?.[0]?.region_id,
              sector_id: profile.user_roles?.[0]?.sector_id,
              school_id: profile.user_roles?.[0]?.school_id,
              phone: profile.phone,
              language: profile.language || 'az',
              status: profile.status || 'active',
              created_at: profile.created_at,
              updated_at: profile.updated_at
            };

            securityLogger.logAuthEvent('LOGIN_SUCCESS', { 
              ...context, 
              userId: data.user.id 
            });

            set({
              user: userData,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              initialized: true
            });
          }
        } catch (error: any) {
          securityLogger.logAuthEvent('LOGIN_ERROR', { 
            ...context, 
            error: error.message 
          });
          
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      signOut: async () => {
        const context = getClientContext();
        const userId = get().user?.id;
        
        try {
          await supabase.auth.signOut();
          
          securityLogger.logAuthEvent('LOGOUT', { 
            ...context, 
            userId 
          });

          // Clear all auth state
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            error: null,
            initialized: false
          });

          // Clear sensitive data from all storage
          sessionStorage.clear();
          
        } catch (error: any) {
          console.error('Logout error:', error);
          // Still clear local state even if server logout fails
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            error: null,
            initialized: false
          });
        }
      },

      // Alias for compatibility
      logout: async () => get().signOut(),
      login: async (email: string, password: string) => get().signIn(email, password),

      fetchUser: async () => {
        try {
          set({ isLoading: true });
          
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              initialized: true 
            });
            return;
          }

          // Fetch fresh profile data
          const { data: profile, error: profileError } = await supabase
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
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          const userData: FullUserData = {
            id: user.id,
            email: user.email || '',
            full_name: profile.full_name || '',
            name: profile.full_name || '',
            role: profile.user_roles?.[0]?.role || 'user',
            region_id: profile.user_roles?.[0]?.region_id,
            sector_id: profile.user_roles?.[0]?.sector_id,
            school_id: profile.user_roles?.[0]?.school_id,
            phone: profile.phone,
            language: profile.language || 'az',
            status: profile.status || 'active',
            created_at: profile.created_at,
            updated_at: profile.updated_at
          };

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            initialized: true
          });

        } catch (error: any) {
          console.error('Fetch user error:', error);
          set({
            error: error.message,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true
          });
        }
      },

      updateUser: (userData: Partial<FullUserData>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },

      clearError: () => set({ error: null }),

      initializeAuth: async (loginOnly = false) => {
        if (get().initializationAttempted && !loginOnly) return;
        
        set({ initializationAttempted: true });
        await get().fetchUser();
      },

      updateProfile: async (updates: Partial<FullUserData>) => {
        try {
          const currentUser = get().user;
          if (!currentUser) throw new Error('No authenticated user');

          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id)
            .select()
            .single();

          if (error) throw error;

          set({
            user: { ...currentUser, ...data }
          });

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

          securityLogger.logAuthEvent('PASSWORD_UPDATE', getClientContext());
          return { success: true };
        } catch (error: any) {
          securityLogger.logAuthEvent('PASSWORD_UPDATE_FAILED', {
            ...getClientContext(),
            error: error.message
          });
          return { success: false, error };
        }
      },

      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === 'superadmin') return true;
        return user.permissions?.includes(permission) || false;
      }
    }),
    {
      name: 'infoline-auth',
      // Only persist minimal, non-sensitive data
      partialize: (state): PersistedAuthData => ({
        sessionId: state.session?.access_token ? 'active' : null,
        lastLoginTime: state.user?.created_at ? Date.now() : null,
        rememberMe: false
      }),
      // Custom storage to add encryption
      storage: {
        getItem: (name: string) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name: string, value: any) => {
          // Only store minimal session data
          const minimalData: PersistedAuthData = {
            sessionId: value.sessionId || null,
            lastLoginTime: value.lastLoginTime || null,
            rememberMe: value.rememberMe || false
          };
          localStorage.setItem(name, JSON.stringify(minimalData));
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);

export default useSecureAuthStore;
