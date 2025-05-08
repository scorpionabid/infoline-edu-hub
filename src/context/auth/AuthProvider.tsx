
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
        // Implementation omitted for brevity
        setIsLoading(false);
        return { data: userData, error: null };
      } catch (error) {
        setIsLoading(false);
        return { data: null, error };
      }
    },
    createUser: async (userData) => {
      // Implementation omitted for brevity
      return { data: userData, error: null };
    },
    updateUser: async (updates) => {
      if (!user) return false;
      setIsLoading(true);
      try {
        // Implementation omitted for brevity
        setIsLoading(false);
        return true;
      } catch (error) {
        setIsLoading(false);
        return false;
      }
    },
    clearError,
    resetPassword: async (email) => {
      // Implementation omitted
      return { data: null, error: null };
    },
    setError,
    updatePassword: async () => ({ data: null, error: null }),
    updateProfile: async () => ({ data: null, error: null }),
    refreshSession: async () => {},
    refreshProfile: async () => {
      // Just return the current user since this is a mock implementation
      console.log("Refreshing user profile");
      return user;
    },
    signup: async () => ({ user: null, error: null })
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
