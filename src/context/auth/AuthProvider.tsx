
import React, { createContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { FullUserData, AuthContextType } from '@/types/auth';
import { useAuth2 } from '@/hooks/auth/useAuth2';
import { AuthService } from '@/services/auth/AuthService';

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
  const auth = useAuth2();
  const [error, setError] = useState<string>('');

  // Map our new auth hook to maintain backward compatibility
  const value: AuthContextType = {
    user: auth.user,
    session: auth.session,
    isAuthenticated: auth.isAuthenticated,
    authenticated: auth.isAuthenticated, // For backwards compatibility
    loading: auth.isLoading,
    error: error || (auth.error ? auth.error.message : ''),
    
    logIn: async (email, password) => {
      const success = await auth.login(email, password);
      return success ? { data: auth.session, error: null } : { data: null, error: new Error('Login failed') };
    },
    
    register: async (userData) => {
      // This is just a compatibility layer, use proper register in real code
      console.warn('Register functionality should be implemented in AuthService');
      return { data: null, error: null };
    },
    
    logOut: auth.logout,
    
    resetPassword: async (email) => {
      try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);
        return { data, error };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    
    updatePassword: async (password) => {
      try {
        const { data, error } = await supabase.auth.updateUser({ password });
        return { data, error };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    
    sendPasswordResetEmail: async (email) => {
      try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);
        return { data, error };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    
    refreshSession: async () => {
      await auth.refreshSession();
      return { data: auth.session, error: null };
    },
    
    getSession: async () => {
      const { session } = await AuthService.getSession();
      return session;
    },
    
    setSession: (session) => {
      // Can't directly set session in new system, this is a no-op
      console.warn('setSession is deprecated, use refreshSession instead');
    },
    
    updateProfile: async (profileData) => {
      try {
        // This needs to be replaced with a real implementation
        console.warn('updateProfile needs proper implementation');
        return { data: null, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    
    fetchUserData: async () => auth.refreshUserData(),
    
    clearErrors: auth.clearError,
    
    setUser: (userData) => {
      console.warn('setUser is deprecated, use proper state management');
    },
    
    setLoading: (loading) => {
      console.warn('setLoading is deprecated, use proper state management');
    },
    
    setError: (errorMsg) => setError(errorMsg),
    
    updateUserData: async (userData) => {
      try {
        // This needs to be replaced with a real implementation
        console.warn('updateUserData needs proper implementation');
        return { data: null, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
