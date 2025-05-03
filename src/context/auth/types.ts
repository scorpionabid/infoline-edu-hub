
import { Session } from "@supabase/supabase-js";
import { FullUserData } from '@/types/user';

export type Role = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export type AuthStatus = "SIGNED_IN" | "SIGNED_OUT" | "INITIAL_LOADING" | "INITIAL_SESSION";

export interface AuthContextType {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp?: (email: string, password: string, metadata?: object) => Promise<void>;
  signOut?: () => Promise<void>;
  updateUser?: (updates: Partial<FullUserData>) => Promise<boolean>;
  createUser?: (userData: any) => Promise<any>;
  clearError: () => void;
}
