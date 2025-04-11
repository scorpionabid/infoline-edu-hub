
import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { AuthUser } from '@/types/auth';
import { AuthContext } from './context';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}

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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

