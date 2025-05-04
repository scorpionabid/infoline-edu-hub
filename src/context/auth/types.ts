
import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/supabase';

export type AuthErrorType = string | null;

export type Role = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface AdminEntity {
  type?: string;
  name?: string;
  status?: string;
  schoolType?: string;
  sectorName?: string;
  regionName?: string;
  schoolName?: string;
}

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
  refreshProfile: () => Promise<FullUserData | null>;
}

export interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
