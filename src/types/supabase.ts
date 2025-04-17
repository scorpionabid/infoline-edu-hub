import { Json } from './json';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export type UserStatus = 'active' | 'inactive' | 'blocked';

export type Language = 'az' | 'en' | 'ru' | 'tr';

export interface NotificationSettings {
  email: boolean;
  system: boolean;
  push?: boolean;
  sms?: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar?: string | null;
  phone?: string | null;
  position?: string | null;
  language: 'az' | 'en' | 'ru' | 'tr';
  last_login?: string | null;
  status: 'active' | 'inactive' | 'blocked';
  created_at: string;
  updated_at: string;
  email?: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  phone?: string | null;
  position?: string | null;
  language: 'az' | 'en' | 'ru' | 'tr';
  avatar?: string | null;
  status: 'active' | 'inactive' | 'blocked';
  last_login?: string | null;
  created_at: string;
  updated_at: string;
  
  name: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  
  adminEntity?: any;
  
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
  region_name?: string;
  sector_name?: string;
}
