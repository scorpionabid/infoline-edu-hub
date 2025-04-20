
import { UserRole, FullUserData } from '@/types/supabase';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: FullUserData | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  userRole?: UserRole;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
