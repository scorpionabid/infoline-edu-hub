
import { Profile } from '@/types/supabase';
import { UserRole } from '@/types/supabase';
import { FullUserData } from '@/types/supabase';

export interface AuthState {
  user: FullUserData | null;
  session: any | null;
  loading: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  fetchUserData: (userId: string) => Promise<FullUserData>;
}

export type UseSupabaseAuthReturn = AuthState & AuthActions;
