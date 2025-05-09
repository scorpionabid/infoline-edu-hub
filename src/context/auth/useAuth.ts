
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
  
  // If context is available, use it; otherwise, use the Zustand store directly
  if (context) {
    return context;
  }
  
  // Fall back to direct Zustand store usage
  const {
    user,
    session,
    isAuthenticated,
    isLoading: loading,
    error,
    login,
    logout,
    clearError,
    refreshProfile,
    refreshSession,
    updatePassword,
    updateProfile,
    resetPassword,
    register,
    signup,
    updateUser,
    setError
  } = useAuthStore();
  
  // Return an object that matches the AuthContextType interface
  return {
    user,
    session,
    isAuthenticated,
    authenticated: isAuthenticated,
    loading,
    error,
    logIn: async (email, password) => {
      const success = await login(email, password);
      return { data: success ? user : null, error: success ? null : error };
    },
    login,
    logOut: logout,
    logout,
    signOut: logout,
    updateUser,
    clearError,
    refreshProfile,
    refreshSession,
    updatePassword,
    updateProfile,
    resetPassword,
    register,
    setError,
    createUser: register,
    signup
  };
};

export default useAuth;
