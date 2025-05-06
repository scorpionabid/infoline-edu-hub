
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
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email?: boolean;
    inApp?: boolean;
    sms?: boolean;
    deadlineReminders?: boolean;
  };
  // Əlavə alias adlar JavaScript konvensiyasına uyğun
  name?: string; 
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
  status: 'active' | 'inactive';
  password?: string;
  language: string;
  avatar?: string;
  position?: string;
  notificationSettings?: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    deadlineReminders: boolean;
  };
  // Əlavə alias adlar
  name?: string; 
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}
