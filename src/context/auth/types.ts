
import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/supabase';

export type AuthErrorType = string | null;

export interface AuthContextType {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthErrorType;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<FullUserData>) => Promise<boolean>;
  clearError: () => void;
  signIn?: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signOut?: () => Promise<void>;
}
