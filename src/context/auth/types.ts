
import { FullUserData } from '@/types/supabase';
import { AuthUser } from '@/types/auth';

// Mövcud rol tipləri
export type Role = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// Auth vəziyyəti interfeysi
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth kontekst interfeysi
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateUser: (userData: Partial<AuthUser>) => Promise<boolean>;
  clearError: () => void;
}
