
import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/supabase';

// Error type
export type AuthErrorType = string | null;

// Role type (for backward compatibility)
export type Role = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// Auth Context Type
export interface AuthContextType {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  authenticated: boolean; // Alias for isAuthenticated
  loading: boolean;
  error: AuthErrorType;
  
  // Auth operations
  logIn: (email: string, password: string) => Promise<{ data: any; error: any; }>;
  login: (email: string, password: string) => Promise<boolean>;
  logOut: () => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // User data operations
  updateUser: (data: Partial<FullUserData>) => void;
  updateUserProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  
  // Error handling
  clearError: () => void;
  setError: (error: string | null) => void;
  
  // Profile operations
  refreshProfile: () => Promise<FullUserData | null>;
  refreshSession: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  
  // Password operations
  resetPassword: (email: string) => Promise<any>;
  
  // User registration
  register: (userData: any) => Promise<any>;
  createUser: (userData: any) => Promise<any>;
  signup: (email: string, password: string, options?: any) => Promise<{ user: any; error: any }>;
}

// Add UserFormData type for backward compatibility
export interface UserFormData {
  id?: string;
  email: string;
  password?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  role: string;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  phone?: string | null;
  position?: string | null;
  language?: string;
  avatar?: string | null;
  status?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  notification_settings?: any;
  notificationSettings?: any;
  entityTypes?: string[];
}
