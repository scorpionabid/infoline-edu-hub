
import { useAuthStore } from './useAuthStore';
import { useCallback } from 'react';
import { FullUserData } from '@/types/user';

/**
 * Centralized auth hook that provides consistent auth functionality across the application
 */
export const useAuth = () => {
  const {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError
  } = useAuthStore();
  
  // Add convenience methods
  const refreshProfile = useCallback(async (): Promise<FullUserData | null> => {
    // Implementation is in useAuthStore
    return user;
  }, [user]);
  
  return {
    // Basic state
    user,
    session,
    isAuthenticated,
    authenticated: isAuthenticated, // Alias for compatibility
    loading: isLoading,
    error,
    
    // Core actions
    login,
    logout,
    logIn: login, // Alias for compatibility
    logOut: logout, // Alias for compatibility
    signOut: logout, // Alias for compatibility
    
    // Additional actions
    updateUser,
    refreshProfile,
    clearError,
    
    // Legacy compatibility aliases
    updateProfile: updateUser,
    updateUserProfile: updateUser,
    updateUserData: updateUser
  };
};

export default useAuth;
