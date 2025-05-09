
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

  // Initialize auth on mount - only refresh session once
  useEffect(() => {
    console.log("[AuthProvider] Initializing authentication");
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create memoized context value to avoid unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(() => {
    console.log("[AuthProvider] Creating context value, user:", user?.email, "role:", user?.role);
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
      signup,
      updateUserData: async (data) => {
        try {
          const result = await updateProfile(data);
          return result;
        } catch (error) {
          console.error('Error updating user data:', error);
          return { data: null, error };
        }
      }
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
