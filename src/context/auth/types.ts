
import { FullUserData, UserRole } from '@/types/supabase';

// İstifadəçi rolları
export type Role = UserRole;

// Auth vəziyyət interfeysi
export interface AuthState {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth kontext interfeysi
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<FullUserData>) => Promise<boolean>;
  clearError: () => void;
}
