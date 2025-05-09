
import React, { useEffect } from 'react';
import { AuthContext } from './context';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { AuthContextType } from './types';

/**
 * AuthProvider - Provides auth state and operations via Context API
 * Acts as an adapter to the Zustand store, maintaining backward compatibility
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get all state and functions from the Zustand store
  const { 
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshAuth,
    clearError,
    setUser,
    setSession,
    setError,
    resetAuth,
    updateUser,
    updatePassword,
    updateProfile,
    resetPassword,
    register,
    refreshProfile,
    refreshSession,
    signup
  } = useAuthStore();
  
  // Provider value with compatibility for all interfaces
  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated,
    authenticated: isAuthenticated, // Alias
    loading: isLoading, // Alias
    error,
    logIn: async (email, password) => {
      const success = await login(email, password);
      return { data: success ? user : null, error: success ? null : error };
    },
    login, // Alias
    logOut: logout,
    logout, // Alias
    signOut: logout, // Alias
    updateUser,
    clearError,
    refreshProfile,
    refreshSession,
    updatePassword,
    updateProfile,
    updateUserProfile: updateProfile, // Alias for backward compatibility
    resetPassword,
    register,
    setError,
    createUser: register,
    signup
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
