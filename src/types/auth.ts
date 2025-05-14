
import { Session } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'blocked';

export interface UserNotificationSettings {
  email: boolean;
  push: boolean;
  app?: boolean;
  // Add these for compatibility with NotificationSettings
  inApp?: boolean;
  system?: boolean;
  deadline?: boolean;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status: UserStatus;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  // Support both for backward compatibility
  notification_settings?: UserNotificationSettings;
  notificationSettings?: UserNotificationSettings;
}

export interface AuthStore {
  user: FullUserData | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  authenticated: boolean;
  loading: boolean;
  error: string;
  logIn: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  sendPasswordResetEmail: (email: string) => Promise<any>;
  refreshSession: () => Promise<any>;
  getSession: () => Promise<Session | null>;
  setSession: (session: Session | null) => void;
  updateProfile: (profileData: Partial<FullUserData>) => Promise<any>;
  fetchUserData: () => Promise<FullUserData | null>;
  clearErrors: () => void;
  setUser: (user: FullUserData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  updateUserData: (data: Partial<FullUserData>) => Promise<any>;
}
