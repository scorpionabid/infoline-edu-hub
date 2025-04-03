
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';
import { UserRole } from '@/types/supabase';

// Default dəyər təyin edirik ki, kontekst yaradılanda boş dəyər olmasın
const defaultAuthValue = {
  user: null,
  loading: true,
  error: null,
  session: null,
  login: async () => ({ error: new Error("Auth context not initialized") }),
  signup: async () => ({ error: new Error("Auth context not initialized") }),
  logout: async () => {},
  updateProfile: async () => {},
  resetPassword: async () => ({ error: new Error("Auth context not initialized") }),
  updatePassword: async () => ({ error: new Error("Auth context not initialized") }),
  clearError: () => {},
  isAuthenticated: false,
  hasRole: () => false,
  isLoading: true,
  sendPasswordReset: async () => false,
  confirmPasswordReset: async () => false
};

// Auth context for application-wide auth state
const AuthContext = createContext(defaultAuthValue);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthHook();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth throughout the application
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role checking hook for conditional rendering
export const useRole = (
  role: UserRole | UserRole[], 
  fallback: JSX.Element | null = null
): boolean | JSX.Element | null => {
  const { user, loading } = useAuth();
  
  if (loading) return fallback;
  
  if (!user) return fallback;
  
  if (Array.isArray(role)) {
    return role.includes(user.role as UserRole) || fallback;
  }
  
  return user.role === role || fallback;
};
