
import React, { useEffect } from 'react';
import { AuthContext } from './context';
import { AuthContextType } from './types';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

/**
 * AuthProvider - Auth state və əməliyyatlarını təqdim edir
 * Zustand store-a wrapper olaraq işləyir
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Zustand store-dan auth state və funksiyaları əldə edirik
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
    setIsLoading,
    resetAuth
  } = useAuthStore();
  
  // Auth state listener-i qurulur
  useEffect(() => {
    // AuthStore-da artıq auth listener qurulub,
    // burada əlavə bir şey etməyə ehtiyac yoxdur
    console.log('AuthProvider mounted, using AuthStore');
    
    return () => {
      console.log('AuthProvider unmounted');
    };
  }, []);
  
  // Context value yaradırıq
  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser: async (updates) => {
      if (!user) return false;
      setIsLoading(true);
      const result = await useAuthStore.getState().updateUser(updates);
      setIsLoading(false);
      return result;
    },
    clearError,
    refreshProfile: async () => {
      if (!session) return null;
      setIsLoading(true);
      const updatedUser = await refreshAuth();
      setIsLoading(false);
      return updatedUser;
    },
    // Legacy support
    signIn: login,
    signOut: logout,
    createUser: async (userData) => {
      setIsLoading(true);
      const result = await useAuthStore.getState().createUser(userData);
      setIsLoading(false);
      return result;
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
