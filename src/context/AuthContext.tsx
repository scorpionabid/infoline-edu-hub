
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { FullUserData, UserRole } from '@/types/supabase';

// Auth konteksti üçün tip təriflərini əlavə edirik
interface AuthContextType {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  confirmPasswordReset: (password: string) => Promise<void>;
  updateProfile: (userData: Partial<FullUserData>) => Promise<boolean>;
  updateUser: (userData: Partial<FullUserData>) => Promise<boolean>; // Adding this to match usage
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  hasRole: (role: string | string[]) => boolean;
}

// Kontekst yaradırıq
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kontekst provide'rını yaradırıq
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    loading: isLoading,
    error,
    clearError,
    signIn,
    signOut,
    signUp: registerUser,
    sendPasswordResetEmail,
    confirmPasswordReset,
    updateProfile,
    changePassword,
    hasRole,
  } = useSupabaseAuth();

  // Auth kontekstinin dəyərlərini formalaşdırırıq
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    clearError,
    login: signIn,
    logout: signOut,
    signUp: registerUser,
    sendPasswordResetEmail,
    confirmPasswordReset,
    updateProfile,
    updateUser: updateProfile, // Alias for updateProfile to fix existing code
    changePassword,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// AuthContext'i istifadə etmək üçün hook yaradırıq
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Rol yoxlanışı üçün utility hook
export const useRole = (requiredRole: string | string[]): boolean => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user?.role === requiredRole;
};

// Rol görünürlüyü üçün HOC (Higher Order Component)
export const withRole = (requiredRole: string | string[], Component: React.FC<any>) => {
  return (props: any) => {
    const hasRequiredRole = useRole(requiredRole);
    
    if (!hasRequiredRole) {
      return null;
    }
    
    return <Component {...props} />;
  };
};

// UserRole tipini eksport edirik
export type { UserRole };

// UserRole tipi üçün göstərici  
export const Role = {
  SUPER_ADMIN: "superadmin" as UserRole,
  REGION_ADMIN: "regionadmin" as UserRole,
  SECTOR_ADMIN: "sectoradmin" as UserRole,
  SCHOOL_ADMIN: "schooladmin" as UserRole,
};
