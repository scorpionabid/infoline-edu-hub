
import { createContext } from 'react';
import { AuthUser } from '@/types/auth';

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateUser: (userData: Partial<AuthUser>) => Promise<boolean>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => false,
  logout: async () => {},
  resetPassword: async () => false,
  updatePassword: async () => false,
  updateUser: async () => false,
  clearError: () => {}
});
