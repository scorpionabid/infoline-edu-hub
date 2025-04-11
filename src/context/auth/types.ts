
import { FullUserData } from '@/types/supabase';

// Mövcud rol tipləri
export type Role = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// Auth vəziyyəti interfeysi
export interface AuthState {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth kontekst interfeysi
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  updateUser: (userData: Partial<FullUserData>) => Promise<boolean>;
  clearError: () => void;
}
