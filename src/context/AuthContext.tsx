
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook, UseAuthReturn } from '@/hooks/useAuth';
import { UserRole } from '@/types/supabase';

// Auth context for application-wide auth state
const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

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
