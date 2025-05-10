
import React, { createContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, AuthContextType } from '@/types/auth';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  authenticated: false,
  loading: true,
  error: '',
  logIn: async () => null,
  register: async () => null,
  logOut: async () => {},
  resetPassword: async () => null,
  updatePassword: async () => null,
  sendPasswordResetEmail: async () => null,
  refreshSession: async () => null,
  getSession: async () => null,
  setSession: () => {},
  updateProfile: async () => null,
  fetchUserData: async () => null,
  clearErrors: () => {},
  setUser: () => {},
  setLoading: () => {},
  setError: () => {},
  updateUserData: async () => null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const {
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    sendPasswordResetEmail,
    refreshSession,
    getSession,
    updateProfile,
    fetchUserData,
    updateUserData
  } = useSupabaseAuth();

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          const userData = await fetchUserData();
          if (userData) {
            setUser(userData);
          }
        }
      } catch (err: any) {
        console.error('Session check error:', err);
        setError(err.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'SIGNED_IN' && currentSession) {
          setSession(currentSession);
          const userData = await fetchUserData();
          if (userData) {
            setUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearErrors = () => {
    setError('');
  };

  const isAuthenticated = !!session && !!user;

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated,
    authenticated: isAuthenticated, // For backwards compatibility
    loading,
    error,
    logIn: login,
    register,
    logOut: logout,
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
