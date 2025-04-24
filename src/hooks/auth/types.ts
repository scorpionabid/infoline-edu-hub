
import { Profile, UserRoleData, FullUserData } from '@/types/supabase';

export interface AuthState {
  user: FullUserData | null;
  session: any | null;
  loading: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{
    data: any;
    error: any;
  }>;
  signUp: (email: string, password: string, userData?: Partial<Profile>) => Promise<{
    data: any;
    error: any;
  }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  fetchUserDetails: (userId: string) => Promise<FullUserData | null>;
}

export type UseSupabaseAuthReturn = AuthState & AuthActions;
