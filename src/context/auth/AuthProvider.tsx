
import React, { createContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContextType, FullUserData } from '@/types/auth';
import { useAuth2 } from '@/hooks/auth/useAuth2';
import { AuthService } from '@/services/auth/AuthService';

// Use the AuthContextType from @/types/auth.ts instead of redefining it
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  authenticated: false,
  loading: true,
  error: null,
  logIn: async () => ({ data: null, error: null }),
  login: async () => false,
  register: async () => null,
  logOut: async () => {},
  logout: async () => {},
  resetPassword: async () => null,
  updatePassword: async () => ({ data: null, error: null }),
  sendPasswordResetEmail: async () => null,
  refreshSession: async () => {},
  getSession: async () => null,
  setSession: () => {},
  updateProfile: async () => ({ data: null, error: null }),
  fetchUserData: async () => null,
  clearErrors: () => {},
  setUser: () => {},
  setLoading: () => {},
  setError: () => {},
  updateUserData: async () => ({ data: null, error: null }),
  clearError: () => {},
  refreshProfile: async () => null,
  updateUser: () => {},
  updateUserProfile: async () => ({ data: null, error: null }),
  signOut: async () => {},
  createUser: async () => ({ data: null, error: null }),
  signup: async () => ({ user: null, error: null })
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
    error: error || (auth.error ? auth.error.message : null),
    
    logIn: async (email, password) => {
      const success = await auth.login(email, password);
      return success ? { data: auth.session, error: null } : { data: null, error: new Error('Login failed') };
    },
    
    login: auth.login,
    
    register: async (userData) => {
      // This is just a compatibility layer, use proper register in real code
      console.warn('Register functionality should be implemented in AuthService');
      return { data: null, error: null };
    },
    
    logOut: auth.logout,
    logout: auth.logout,
    signOut: auth.logout,
    
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
    
    refreshSession: auth.refreshSession,
    
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
    
    fetchUserData: auth.refreshUserData,
    clearError: auth.clearError,
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
    },
    
    updateUser: (userData) => {
      // In a real implementation, this would update the user data
      console.warn('updateUser needs proper implementation');
    },
    
    updateUserProfile: async (userData) => {
      try {
        // This needs to be replaced with a real implementation
        console.warn('updateUserProfile needs proper implementation');
        return { data: null, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    
    createUser: async (userData) => {
      try {
        // This needs to be replaced with a real implementation
        console.warn('createUser needs proper implementation');
        return { data: null, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    
    signup: async (email, password, options) => {
      try {
        // This needs to be replaced with a real implementation
        console.warn('signup needs proper implementation');
        return { user: null, error: null };
      } catch (err: any) {
        return { user: null, error: err };
      }
    },
    
    // Add the missing refreshProfile method
    refreshProfile: async () => {
      try {
        if (!auth.user?.id) {
          return null;
        }
        
        // In a real implementation, this would fetch user profile data
        const userData = await auth.refreshUserData();
        return userData;
      } catch (err) {
        console.error('Error refreshing profile:', err);
        return null;
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
