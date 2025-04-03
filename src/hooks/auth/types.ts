
import { Session, User } from '@supabase/supabase-js';
import { FullUserData } from '@/types/supabase';

export interface AuthState {
  user: FullUserData | null;
  loading: boolean;
  error?: Error | null;
  session: Session | null;
  profile: any | null;
}

export type AuthAction =
  | { type: 'SET_USER'; payload: FullUserData | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'CLEAR_ERROR' };

export interface UseSupabaseAuthReturn {
  user: FullUserData | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<{ user: FullUserData | null; error: Error | null }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  confirmPasswordReset: (newPassword: string) => Promise<boolean>;
  clearError: () => void;
}
