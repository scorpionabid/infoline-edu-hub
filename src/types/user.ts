
import { Session } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'guest';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  region_id?: string;
  region_name?: string;
  sector_id?: string;
  sector_name?: string;
  school_id?: string;
  school_name?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  avatar?: string;
  position?: string;
  notificationSettings?: NotificationSettings;
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  };
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push: boolean;
  system: boolean;
  deadline: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
}

export interface FullUserData extends User {
  notificationSettings: NotificationSettings;
}

export type AuthErrorType = string | null;

export interface UserFormData {
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  avatar?: string;
  position?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface AuthContextType {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  authenticated: boolean;
  loading: boolean; 
  error: AuthErrorType;
  signIn: (email: string, password: string) => Promise<{data: any, error: any}>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{data: any, error: any}>;
  updatePassword: (password: string) => Promise<{data: any, error: any}>;
  updateProfile: (data: Partial<User>) => Promise<{data: any, error: any}>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<{data: any, error: any}>;
  updateEmail: (email: string) => Promise<{data: any, error: any}>;
  loadUserProfile: () => Promise<void>;
  createUser?: (userData: UserFormData) => Promise<{data: any, error: any}>;
  updateUser?: (userId: string, userData: Partial<UserFormData>) => Promise<{data: any, error: any}>;
}

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  roleObj?: {
    id: string;
    role: UserRole;
    region_id?: string;
    sector_id?: string;
    school_id?: string;
  };
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  status: string;
  email: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  created_at?: string;
  updated_at?: string;
}
