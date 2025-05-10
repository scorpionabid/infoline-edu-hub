
import { useContext, useCallback } from 'react';
import { AuthContext } from './AuthProvider';
import { FullUserData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  const {
    user,
    session,
    isAuthenticated,
    loading,
    error,
    logIn,
    register,
    logOut,
    resetPassword,
    updatePassword,
    sendPasswordResetEmail,
    refreshSession,
    getSession,
    setSession,
    updateProfile,
    fetchUserData,
    clearErrors,
    setUser,
    setLoading,
    setError,
    updateUserData
  } = context;

  // Refetch user data 
  const refetchUser = useCallback(async () => {
    if (!isAuthenticated) return null;
    
    try {
      setLoading(true);
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
        return userData;
      }
      return null;
    } catch (err: any) {
      console.error('Error refetching user data:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchUserData, setUser, setLoading, setError]);

  return {
    user,
    session,
    isAuthenticated,
    authenticated: isAuthenticated, // For backwards compatibility
    loading,
    error,
    logIn,
    register,
    logOut,
    resetPassword,
    updatePassword,
    sendPasswordResetEmail,
    refreshSession,
    getSession,
    setSession,
    updateProfile,
    fetchUserData,
    clearErrors,
    refetchUser,
    setUser,
    setLoading,
    setError,
    updateUserData
  };
};

export default useAuth;
