
import { FullUserData, Profile } from '@/types/supabase';

// Auth state üçün tipimizi təyin edək
export interface AuthState {
  loading: boolean;
  user: FullUserData | null;
  session: any | null;
  isAuthenticated: boolean;
  error: string | null;
}

// Auth funksiyaları üçün tipimizi təyin edək
export interface AuthActions {
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<any>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  fetchUserData: (userId: string) => Promise<FullUserData>;
}

// useSupabaseAuth hook-un return tipi
export interface UseSupabaseAuthReturn extends AuthState, AuthActions {}
