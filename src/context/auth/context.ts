
import { createContext } from 'react';
import { AuthContextType } from './types';
import { AuthUser } from '@/types/auth';

// Default auth konteksti dəyərləri
const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: async () => false,
  resetPassword: async () => false,
  updatePassword: async () => false,
  updateUser: async () => false,
  clearError: () => {}
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
