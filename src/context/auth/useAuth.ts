
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './context';
import { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading } from '@/hooks/auth/useAuthStore';
import { AuthContextType } from './types';

/**
 * useAuth - Hook for accessing auth state and operations
 * This hook now primarily pulls from the Zustand store, with fallback to context
 * to maintain backward compatibility and ensure consistent state
 */
export const useAuth = (): AuthContextType => {
  // Get data from Zustand store
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const store = useAuthStore();
  
  // Try to get context for backward compatibility
  let context;
  try {
    context = useContext(AuthContext);
  } catch (error) {
    console.warn('AuthContext not available, falling back to Zustand store');
    context = null;
  }
  
  // If context is completely missing, rely on Zustand store
  if (!context) {
    // Return an object that matches the AuthContextType interface
    return {
      user,
      session: store.session,
      isAuthenticated,
      authenticated: isAuthenticated,
      loading: isLoading,
      error: store.error,
      logIn: async (email, password) => {
        const success = await store.login(email, password);
        return { data: success ? store.user : null, error: success ? null : store.error };
      },
      login: store.login,
      logOut: store.logout,
      logout: store.logout,
      signOut: store.logout,
      updateUser: store.updateUser,
      clearError: store.clearError,
      refreshProfile: store.refreshProfile,
      refreshSession: store.refreshSession,
      updatePassword: store.updatePassword,
      updateProfile: store.updateProfile,
      updateUserProfile: store.updateProfile,
      resetPassword: store.resetPassword,
      register: store.register,
      setError: store.setError,
      createUser: store.createUser,
      signup: store.signup,
      updateUserData: async (data) => {
        try {
          const result = await store.updateProfile(data);
          return result;
        } catch (error) {
          console.error('Error updating user data:', error);
          return { data: null, error };
        }
      }
    };
  }
  
  // Use context if available (to maintain backward compatibility)
  return context;
};

export default useAuth;
