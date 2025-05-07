
import { UserRole } from './supabase';

export interface User {
  id: string;
  email?: string;
  name?: string;
  full_name?: string;
  role?: UserRole | string;
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
  logOut: () => Promise<void>;
  logout: () => Promise<void>; // logOut üçün alias
  signOut: () => Promise<void>; // logOut üçün alias
  register: (userData: any) => Promise<any>;
  updateUser: (updates: Partial<FullUserData>) => Promise<boolean | void>;
  updateUserProfile?: (userData: Partial<FullUserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError?: () => void;
  refreshProfile?: () => Promise<FullUserData | null>;
  createUser?: (userData: UserFormData) => Promise<{ data: any; error: any }>;
}
