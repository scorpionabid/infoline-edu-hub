
import React, { useEffect, useMemo } from 'react';
import { AuthContext } from './context';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { AuthContextType } from './types';

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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

  // This effect only runs once during initialization
  useEffect(() => {
    // Attempt to refresh the session when the component mounts
    const initializeAuth = async () => {
      await refreshSession();
    };
    
    initializeAuth();
    // We intentionally omit refreshSession from the deps array to avoid
    // re-running this effect when the function reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create the context value with memoization to avoid unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(() => {
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
      updateUserProfile: updateProfile,
      resetPassword,
      register,
      setError,
      createUser: register,
      signup
    };
  }, [
    user,
    session,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    refreshProfile,
    refreshSession,
    updatePassword,
    updateProfile,
    resetPassword,
    register,
    signup,
    setError
  ]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
