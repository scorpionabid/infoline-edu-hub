
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { FullUserData } from '@/types/supabase';

// Auth konteksti üçün tip təriflərini əlavə edirik
interface AuthContextType {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  confirmPasswordReset: (password: string) => Promise<void>;
  updateProfile: (userData: Partial<FullUserData>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  hasRole: (role: string) => boolean;
}

// Kontekst yaradırıq
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kontekst provide'rını yaradırıq
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    loading: isLoading,
    error,
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
    login: signIn,
    logout: signOut,
    signUp: registerUser,
    sendPasswordResetEmail,
    confirmPasswordReset,
    updateProfile,
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
export const useRole = (requiredRole: string): boolean => {
  const { user } = useAuth();
  return user?.role === requiredRole;
};
