
// @girmə1 - Əlavə etsə bütün FullUserData tipindən istifadə edən yerlərdə avatar və position xassələrini əlavə edək
import { UserRole } from './supabase';

export interface User {
  id: string;
  email: string;
  role?: string | UserRole;
  name?: string;
  full_name?: string;
  phone?: string;
  position?: string;
  language?: string;
  status: 'active' | 'inactive' | 'blocked';
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  avatar?: string;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  name?: string; // Alias to make it compatible with different components
  role?: string | UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'pending' | 'blocked';
  last_login?: string;
  lastLogin?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  avatar?: string;
  adminEntity?: string;
  notificationSettings?: {
    email: boolean;
    inApp: boolean;
    push: boolean;
    system: boolean;
    deadline: boolean;
    sms?: boolean;
    deadlineReminders?: boolean;
  };
}

export interface UserFormData {
  id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  password?: string;
  notificationSettings?: {
    email: boolean;
    inApp: boolean;
    push: boolean;
    system: boolean;
    deadline: boolean;
    sms?: boolean;
    deadlineReminders?: boolean;
  };
}

export interface AuthContextType {
  user: FullUserData | null;
  authenticated: boolean;
  loading: boolean;
  error: string | null;
  logIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  logOut: () => Promise<void>;
  register: (userData: any) => Promise<any>;
  updateUser: (userData: Partial<FullUserData>) => Promise<void>;
  updateUserProfile?: (userData: Partial<FullUserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setError: (error: string | null) => void;
}
