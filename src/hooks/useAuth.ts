
import { useCallback } from 'react';
import { FullUserData, UserRole } from '@/types/supabase';
import { useAuthState } from './auth/useAuthState';
import { useAuthOperations } from './auth/useAuthOperations';
import { useAuthSession } from './auth/useAuthSession';
import { useAuthRoles, useRoleCheck } from './auth/useAuthRoles';

export type UseAuthReturn = {
  user: FullUserData | null;
  loading: boolean;
  error: Error | null;
  session: any | null;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  signup: (email: string, password: string, userData: Partial<FullUserData>) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<FullUserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (password: string) => Promise<{ error: any | null }>;
  clearError: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isLoading: boolean;
  sendPasswordReset: (email: string) => Promise<boolean>;
  confirmPasswordReset: (password: string) => Promise<boolean>;
};

/**
 * Auth hook - ümumi tətbiq authentication vəziyyəti idarəetməsi
 */
export const useAuth = (): UseAuthReturn => {
  // Auth state
  const { state, setState, clearError } = useAuthState();
  
  // Auth əməliyyatları
  const operations = useAuthOperations(setState);
  
  // Auth sessiyası
  useAuthSession(setState);
  
  // Rol yoxlaması
  const { hasRole } = useAuthRoles(state);
  
  // Açıq şəkildə isAuthenticated dəyərini hesablayaq
  const isAuthenticated = !!state.user && !!state.session;
  
  // İxrac edəcəyimiz funksiyalar
  return {
    ...state,
    login: operations.login,
    signup: operations.signup,
    logout: operations.logout,
    updateProfile: operations.updateProfile,
    resetPassword: operations.resetPassword,
    updatePassword: operations.updatePassword,
    clearError,
    isAuthenticated,
    hasRole,
    isLoading: state.loading,
    sendPasswordReset: operations.sendPasswordReset,
    confirmPasswordReset: operations.confirmPasswordReset
  };
};

/**
 * Role check hook for conditional rendering
 */
export const useRole = (
  role: UserRole | UserRole[], 
  fallback: JSX.Element | null = null
): boolean | JSX.Element | null => {
  const { user, loading } = useAuth();
  return useRoleCheck(user, loading, role, fallback);
};
