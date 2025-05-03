
import { PostgrestError } from "@supabase/supabase-js";
import { FullUserData } from '@/types/user';

export type AuthStatus = "SIGNED_IN" | "SIGNED_OUT" | "INITIAL_LOADING" | "INITIAL_SESSION";

export type AuthError = {
  message: string;
  error: PostgrestError | Error | null;
};

export interface AuthContextType {
  user: FullUserData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: object) => Promise<void>;
  signOut: () => Promise<void>;
  status: AuthStatus;
  isLoading: boolean;
  createUser: (userData: any) => Promise<any>;
  error: AuthError | null;
}
