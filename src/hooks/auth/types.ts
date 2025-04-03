
import { User, Session } from '@supabase/supabase-js';
import { FullUserData, Profile } from '@/types/supabase';

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: FullUserData | null;
  loading: boolean;
};

export type ActionType = 'LOGIN' | 'LOGOUT' | 'SESSION' | 'PROFILE' | 'LOADING';

export interface AuthAction {
  type: ActionType;
  payload?: any;
}

export interface UseSupabaseAuthReturn {
  auth: {
    currentUser: User | null;
    session: Session | null;
  };
  login: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  logout: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: Error | null }>;
  updateProfile: (profile: Partial<Profile>) => Promise<{ profile: Profile | null; error: Error | null }>;
}
