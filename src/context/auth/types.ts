
import { UserRole, FullUserData } from '@/types/supabase';

export type Role = UserRole;

export interface AuthState {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: FullUserData | null;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  userRole?: UserRole;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser?: (userData: Partial<FullUserData>) => Promise<boolean>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
