
import React, { createContext, ReactNode, useContext } from 'react';
import { FullUserData, UserRole } from '@/types/supabase';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

// Default auth konteksti dəyərləri
export const defaultAuthContext = {
  user: null,
  loading: true,
  error: null,
  session: null,
  login: async (email: string, password: string) => ({ error: new Error('Not implemented') }),
  signup: async (email: string, password: string, userData: Partial<FullUserData>) => ({ error: new Error('Not implemented') }),
  logout: async () => {},
  updateProfile: async (profileData: Partial<FullUserData>) => {},
  resetPassword: async (email: string) => ({ error: null }),
  updatePassword: async (password: string) => ({ error: null }),
  clearError: () => {},
  isAuthenticated: false,
  hasRole: (role: UserRole | UserRole[]) => false,
  isLoading: true,
  sendPasswordReset: async (email: string) => false,
  confirmPasswordReset: async (password: string) => false,
};

// Auth kontekstinin yaradılması
const AuthContext = createContext(defaultAuthContext);

// Auth provider komponenti
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuthHook();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Auth kontekstini istifadə etmək üçün hook
export const useAuth = () => useContext(AuthContext);
