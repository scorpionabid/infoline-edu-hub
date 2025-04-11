
import { FullUserData } from '@/types/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  session?: Session | null;
  loading?: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  updateUser: (userData: Partial<FullUserData>) => Promise<boolean>;
  clearError: () => void;
  signIn?: (email: string, password: string) => Promise<any>;
  signOut?: () => Promise<void>;
  signUp?: (email: string, password: string, userData: any) => Promise<any>;
  resetPassword?: (email: string) => Promise<boolean>;
  updateProfile?: (updates: any) => Promise<boolean>;
  updatePassword?: (password: string) => Promise<boolean>;
  fetchUserData?: (userId: string) => Promise<FullUserData | null>;
}

export interface UseSupabaseAuthReturn extends AuthState, AuthActions {}
