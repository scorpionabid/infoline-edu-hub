
import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/auth';
import { UserRole } from '@/types/supabase';

export type AuthErrorType = string | null;

export interface UserFormData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  position?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface AuthContextType {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  authenticated: boolean; // Alias for isAuthenticated
  loading: boolean;
  error: AuthErrorType;
  logIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  login: (email: string, password: string) => Promise<boolean>;
  logOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for logOut
  signOut: () => Promise<void>; // Alias for logOut
  updateUser: (data: Partial<FullUserData>) => void;
  updateUserData: (data: Partial<FullUserData>) => Promise<{data: any; error: any}>;
  clearError: () => void;
  refreshProfile: () => Promise<FullUserData | null>;
  refreshSession: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  updateUserProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  resetPassword: (email: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  setError: (error: string | null) => void;
  createUser: (userData: any) => Promise<{ data: any; error: any }>;
  signup: (email: string, password: string, options?: any) => Promise<{ user: any; error: any }>;
}
