// ============================================================================
// İnfoLine Auth Store - Enhanced Security Implementation
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, FullUserData, UserRole } from '@/types/auth';
import { securityLogger, getClientContext } from '@/utils/securityLogger';
import { ENV } from '@/config/environment';

// ============================================================================
// Auth Store Implementation
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      session: null,
      initialized: false,
      initializationAttempted: false,

      // Enhanced signIn with security logging
      signIn: async (email: string, password: string) => {
        const startTime = Date.now();
        
        try {
          set({ isLoading: true, error: null });
          
          securityLogger.logAuthEvent('login_attempt', {
            ...getClientContext(),
            userId: email
          });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            securityLogger.logAuthEvent('login_failure', {
              ...getClientContext(),
              userId: email,
              severity: 'high'
            });
            throw error;
          }

          if (data.user && data.session) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            // Fetch user role
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', data.user.id)
              .single();

            const fullUserData: FullUserData = {
              id: data.user.id,
              email: data.user.email || '',
              full_name: profile?.full_name || '',
              name: profile?.full_name || '',
              role: roleData?.role || 'user',
              region_id: roleData?.region_id,
              sector_id: roleData?.sector_id,
              school_id: roleData?.school_id,
              phone: profile?.phone,
              position: profile?.position,
              language: profile?.language || 'az',
              avatar: profile?.avatar,
              status: profile?.status || 'active',
              last_login: profile?.last_login,
              created_at: profile?.created_at,
              updated_at: profile?.updated_at,
            };

            // Update last login
            await supabase
              .from('profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', data.user.id);

            set({
              user: fullUserData,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              initialized: true
            });

            securityLogger.logAuthEvent('login_success', {
              ...getClientContext(),
              userId: email,
              sessionId: data.session.access_token.substring(0, 8)
            });

            console.log(`[AuthStore] Sign in successful in ${Date.now() - startTime}ms`);
          }
        } catch (error: any) {
          console.error('[AuthStore] Sign in error:', error);
          
          securityLogger.logAuthEvent('login_failure', {
            ...getClientContext(),
            userId: email,
            severity: 'high'
          });
          
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Sign in failed',
            initialized: true
          });
          
          throw error;
        }
      },

      // Enhanced signOut with complete cleanup
      signOut: async () => {
        const currentUser = get().user;
        
        try {
          securityLogger.logAuthEvent('logout', {
            ...getClientContext(),
            userId: currentUser?.email || 'unknown'
          });
          
          console.log('[AuthStore] Starting sign out...');
          
          // Clear state FIRST for immediate UI response
          set({ 
            user: null, 
            isAuthenticated: false, 
            session: null,
            error: null,
            isLoading: false,
            initialized: false,
            initializationAttempted: false
          });
          
          // Clear sensitive storage
          try {
            // Clear Supabase auth keys
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (
                key.includes('supabase') || 
                key.startsWith('app-cache-') || 
                key.startsWith('infoline-') ||
                key.includes('auth') ||
                key.includes('session')
              )) {
                keysToRemove.push(key);
              }
            }
            
            keysToRemove.forEach(key => {
              localStorage.removeItem(key);
            });
            
            // Clear session storage
            sessionStorage.clear();
            
            console.log('[AuthStore] Storage cleared successfully');
          } catch (e) {
            console.warn('[AuthStore] Error clearing storage (non-critical):', e);
          }
          
          // Call Supabase signOut in background
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.warn('[AuthStore] Supabase signOut error (non-critical since state already cleared):', error);
          }
          
          console.log('[AuthStore] Sign out completed successfully');
          
          // Force redirect to login
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            console.log('[AuthStore] Redirecting to login...');
            window.location.replace('/login');
          }
          
        } catch (error: any) {
          console.error('[AuthStore] Sign out error:', error);
          
          securityLogger.logError(error, {
            ...getClientContext(),
            action: 'logout_error',
            userId: currentUser?.email || 'unknown'
          });
          
          // Ensure state is cleared even on error
          set({ 
            user: null, 
            isAuthenticated: false, 
            session: null,
            error: null,
            isLoading: false,
            initialized: false,
            initializationAttempted: false
          });
          
          // Force redirect even on error
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
          
          throw error;
        }
      },

      // Alias for backward compatibility
      logout: async () => {
        await get().signOut();
      },

      login: async (email: string, password: string) => {
        await get().signIn(email, password);
      },

      // Enhanced fetchUser with security validation
      fetchUser: async () => {
        try {
          set({ isLoading: true });
          
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              initialized: true
            });
            return;
          }

          // Validate session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            securityLogger.logAuthEvent('session_expired', {
              ...getClientContext(),
              userId: user.email || 'unknown'
            });
            
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              initialized: true
            });
            return;
          }

          // Fetch complete user data
          const [profileResult, roleResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('user_roles').select('*').eq('user_id', user.id).single()
          ]);

          const fullUserData: FullUserData = {
            id: user.id,
            email: user.email || '',
            full_name: profileResult.data?.full_name || '',
            name: profileResult.data?.full_name || '',
            role: roleResult.data?.role || 'user',
            region_id: roleResult.data?.region_id,
            sector_id: roleResult.data?.sector_id,
            school_id: roleResult.data?.school_id,
            phone: profileResult.data?.phone,
            position: profileResult.data?.position,
            language: profileResult.data?.language || 'az',
            avatar: profileResult.data?.avatar,
            status: profileResult.data?.status || 'active',
            last_login: profileResult.data?.last_login,
            created_at: profileResult.data?.created_at,
            updated_at: profileResult.data?.updated_at,
          };

          set({
            user: fullUserData,
            session,
            isAuthenticated: true,
            isLoading: false,
            initialized: true
          });

        } catch (error: any) {
          console.error('[AuthStore] Fetch user error:', error);
          
          securityLogger.logError(error, {
            ...getClientContext(),
            action: 'fetch_user_error'
          });
          
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

      updateUser: (userData: Partial<FullUserData>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: async (loginOnly: boolean = false) => {
        const state = get();
        
        if (state.initializationAttempted && !loginOnly) {
          return;
        }

        set({ initializationAttempted: true });
        
        console.log('[AuthStore] Initializing auth...');
        
        try {
          // Set up auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('[AuthStore] Auth state changed:', event);
              
              if (event === 'SIGNED_IN' && session) {
                await get().fetchUser();
              } else if (event === 'SIGNED_OUT') {
                set({
                  user: null,
                  session: null,
                  isAuthenticated: false,
                  error: null,
                  initialized: true
                });
              } else if (event === 'TOKEN_REFRESHED' && session) {
                set({ session });
              }
            }
          );

          // Check existing session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            await get().fetchUser();
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              initialized: true
            });
          }

          return () => subscription.unsubscribe();
        } catch (error: any) {
          console.error('[AuthStore] Auth initialization error:', error);
          
          securityLogger.logError(error, {
            ...getClientContext(),
            action: 'auth_init_error'
          });
          
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
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('No authenticated user');
          }

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
          securityLogger.logError(error, {
            ...getClientContext(),
            action: 'update_profile_error',
            userId: get().user?.email
          });
          
          return { success: false, error: error.message };
        }
      },

      updatePassword: async (newPassword: string) => {
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (error) throw error;

          securityLogger.logSecurityEvent('password_updated', {
            ...getClientContext(),
            userId: get().user?.email
          });

          return { success: true };
        } catch (error: any) {
          securityLogger.logError(error, {
            ...getClientContext(),
            action: 'update_password_error',
            userId: get().user?.email
          });
          
          return { success: false, error: error.message };
        }
      },

      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        
        // Super admin has all permissions
        if (user.role === 'superadmin') return true;
        
        // Add more permission logic as needed
        return false;
      },
    }),
    {
      name: 'infoline-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        initialized: state.initialized,
      }),
    }
  )
);

// ============================================================================
// Selectors for better performance
// ============================================================================

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

// ============================================================================
// Utility functions
// ============================================================================

export const shouldAuthenticate = (route: string): boolean => {
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  return !publicRoutes.includes(route);
};

export const isProtectedRoute = (route: string): boolean => {
  return shouldAuthenticate(route);
};

export const getRedirectPath = (userRole: UserRole): string => {
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

export default useAuthStore;
