
/**
 * DEPRECATED: Bu hook artıq hooks/auth/useAuthStore.ts ilə əvəz edilib
 * Bu, əvvəlki import yollarının işləməsini təmin etmək üçün bir körpüdür
 */

import { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading, selectError, selectSession } from '@/hooks/auth/useAuthStore';
import { AuthContextType } from '@/types/auth';

/**
 * Hook to access the Auth context
 * 
 * @deprecated Bu hook hooks/auth/useAuthStore.ts ilə əvəz edilib
 */
export function useAuth(): AuthContextType {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const error = useAuthStore(selectError);
  const session = useAuthStore(selectSession);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    loading: isLoading,
    signIn: async (email: string, password: string) => {
      try {
        await signIn(email, password);
        return {};
      } catch (error: any) {
        return { error: error.message };
      }
    },
    signOut: async () => {
      await signOut();
    },
    logOut: async () => {
      await logout();
    },
    logout: async () => {
      await logout();
    },
    updatePassword: async () => ({ error: 'Not implemented' }),
    updateProfile: async (data) => {
      updateUser(data);
      return {};
    },
    isAuthenticated,
    session
  };
}

export default useAuth;
