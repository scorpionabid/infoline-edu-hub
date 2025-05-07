
import { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status: 'active' | 'inactive' | string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  region_name?: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  sector_id: string;
  region_id: string;
  status: 'active' | 'inactive' | string;
  student_count?: number;
  teacher_count?: number;
  phone?: string;
  email?: string;
  director_name?: string;
  admin_email?: string;
  contact_phone?: string;
  type?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  sector_name?: string;
  region_name?: string;
  completion_rate?: number;
  admin_id?: string;
  principal_name?: string; // Əlavə edildi
  principalName?: string; // TypeScript camelCase alias əlavə edildi
}

export type Language = 'az' | 'en' | 'tr' | 'ru';

export interface FullUserData extends User {
  email: string;
  full_name: string;
  role: UserRole;
  entityName?: string;
  regionName?: string;
  sectorName?: string;
  schoolName?: string;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  language?: Language;
  avatar_url?: string;
  last_login?: string;
  status?: 'active' | 'inactive' | 'pending';
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    deadline: boolean;
  };
}

export type Supabase = SupabaseClient;

export interface SessionUser extends SupabaseUser {
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface UserFormData {
  id?: string;
  email: string;
  full_name: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'pending';
  avatar_url?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    deadline: boolean;
  };
}

export interface UserFilter {
  search?: string;
  role?: string[];
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: string[];
}
