
import { UserRole } from './supabase';

export interface User {
  id: string;
  email?: string;
  name?: string;
  full_name?: string;
  role?: UserRole | string;
  avatar?: string; // Add this property
  position?: string;
  phone?: string;
  language?: string;
  status?: string;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string | UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  language?: string;
  avatar?: string;
  position?: string;
  entityName?: string;
  name?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email?: boolean;
    inApp?: boolean;
    sms?: boolean;
    deadlineReminders?: boolean;
    system?: boolean;
    push?: boolean;
    deadline?: boolean;
  };
  // Əlavə alias adlar JavaScript konvensiyasına uyğun
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  id?: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole | string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status: 'active' | 'inactive' | 'blocked' | 'pending';
  password?: string;
  language: string;
  avatar?: string;
  position?: string;
  notificationSettings?: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    deadlineReminders: boolean;
    system?: boolean;
    push?: boolean;
    deadline?: boolean;
  };
  // Əlavə alias adlar
  name?: string; 
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

export interface AuthContextType {
  user: FullUserData | null;
  session: any | null;
  isAuthenticated: boolean;
  authenticated: boolean; // isAuthenticated ilə eynidir
  loading: boolean;
  error: string | null;
  logIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  login: (email: string, password: string) => Promise<{ user: any; error: any }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>; // logout üçün alias
  signup: (email: string, password: string, options?: any) => Promise<{ user: any; error: any }>;
  register: (userData: any) => Promise<any>;
  updateUser: (updates: Partial<FullUserData>) => Promise<boolean | void>;
  updateUserProfile?: (userData: Partial<FullUserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  setError: (error: string | null) => void;
  clearError?: () => void;
  refreshSession: () => Promise<void>;
  refreshProfile?: () => Promise<FullUserData | null>;
  createUser?: (userData: UserFormData) => Promise<{ data: any; error: any }>;
}
