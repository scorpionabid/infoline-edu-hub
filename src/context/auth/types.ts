
import { FullUserData, UserRole } from '@/types/supabase';

// User roles
export type Role = UserRole;

// Auth state interface
export interface AuthState {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context interface
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<FullUserData>) => Promise<boolean>;
  clearError: () => void;
}
