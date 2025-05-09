
import { useContext } from 'react';
import { AuthContext } from './context';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { AuthContextType } from './types';

/**
 * useAuth - Hook for accessing auth state and operations
 * This hook now primarily pulls from the Zustand store, with fallback to context
 * to maintain backward compatibility
 */
export const useAuth = (): AuthContextType => {
  // Try to get context first for backward compatibility
  let context;
  try {
    context = useContext(AuthContext);
  } catch (error) {
    console.warn('AuthContext not available, falling back to Zustand store');
    context = null;
  }
  
  // If context is available and valid, use it
  if (context && context.user !== undefined) {
    return context;
  }
  
  // Fall back to direct Zustand store usage
  const store = useAuthStore();
  
  // Return an object that matches the AuthContextType interface without causing 
  // infinite updates by avoiding direct destructuring of the store
  return {
    user: store.user,
    session: store.session,
    isAuthenticated: store.isAuthenticated,
    authenticated: store.isAuthenticated, // Alias for isAuthenticated
    loading: store.isLoading,
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
    updateUserProfile: store.updateProfile, // Add this alias for backward compatibility
    resetPassword: store.resetPassword,
    register: store.register,
    setError: store.setError,
    createUser: store.createUser,
    signup: store.signup
  };
};

export default useAuth;
