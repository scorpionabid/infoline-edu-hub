
import { useContext } from 'react';
import { AuthContext } from './context';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

/**
 * useAuth - Hook for accessing auth state and operations
 * This hook now primarily pulls from the Zustand store, with fallback to context
 * to maintain backward compatibility
 */
export const useAuth = () => {
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
    logIn: login,
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
    signup: signup || (async () => ({ user: null, error: new Error('Not implemented') }))
  };
};

export default useAuth;
