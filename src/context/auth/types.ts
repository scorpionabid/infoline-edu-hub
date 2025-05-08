
import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/supabase';

export type AuthErrorType = string | null;

export type Role = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// İstifadəçi yaratmaq üçün form məlumatları
export interface UserFormData {
  email: string;
  password?: string;
  full_name: string;
  role: string;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  phone?: string | null;
  position?: string | null;
  language?: string;
  avatar?: string | null;
  status?: string;
}

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
  authenticated?: boolean;
  loading: boolean;
  error: AuthErrorType;
  logIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  login?: (email: string, password: string) => Promise<any>;
  logOut: () => Promise<void>;
  logout: () => Promise<void>; // logOut üçün alias
  signOut: () => Promise<void>; // logOut üçün alias
  updateUser: (updates: Partial<FullUserData>) => Promise<boolean | void>;
  clearError: () => void;
  refreshProfile: () => Promise<FullUserData | null>;
  refreshSession: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  resetPassword: (email: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  setError: (error: string | null) => void;
  createUser?: (userData: UserFormData) => Promise<{ data: any; error: any }>;
  signup?: (email: string, password: string, options?: any) => Promise<{ user: any; error: any }>;
  updateUserProfile?: (userData: Partial<FullUserData>) => Promise<void | boolean>;
}

export interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
