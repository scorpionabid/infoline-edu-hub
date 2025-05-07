
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
    loading: isLoading,
    error,
    logIn: async (email, password) => {
      try {
        const result = await login(email, password);
        return { data: result, error: null };
      } catch (error: any) {
        return { data: null, error: error?.message || "Login failed" };
      }
    },
    logOut: logout,
    logout: logout,
    signOut: logout,
    register: async (userData) => {
      setIsLoading(true);
      try {
        if (useAuthStore.getState().createUser) {
          const result = await useAuthStore.getState().createUser(userData);
          setIsLoading(false);
          return result;
        }
        throw new Error('createUser method not available');
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    },
    updateUser: async (updates) => {
      if (!user) return;
      setIsLoading(true);
      try {
        if (useAuthStore.getState().updateUser) {
          const result = await useAuthStore.getState().updateUser(updates);
          setIsLoading(false);
          return result;
        }
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    },
    clearError,
    resetPassword: async (email) => {
      // implementation
    },
    setError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
