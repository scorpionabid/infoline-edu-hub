
import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { AuthUser } from '@/types/auth';
import { AuthContext } from './context';
import { AuthContextType } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateUser,
    clearError
  } = useSupabaseAuth();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    console.info('Auth inisializasiya başladı');
    console.info('Auth vəziyyəti dəyişdi:', {
      isAuthenticated: !!user,
      isLoading,
      user,
      error,
    });

    setIsAuthenticated(!!user);
  }, [user, isLoading, error]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
