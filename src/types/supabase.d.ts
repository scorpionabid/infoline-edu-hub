
import { Database } from './database';

// Auth istifadəçi məlumatları
export interface FullUserData {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  position?: string;
  role?: string;
  language?: Language;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  school_name?: string;
  last_login?: string;
  status?: 'active' | 'inactive' | 'blocked';
  created_at?: string;
  updated_at?: string;
}

export type Language = 'az' | 'en' | 'ru' | 'tr';

// Regionlar üçün tip
export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  cover_image?: string;
}

// Sektorlar üçün tip
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  cover_image?: string;
}

// Məktəblər üçün tip
export interface School {
  id: string;
  name: string;
  address?: string;
  region_id: string;
  sector_id: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  logo?: string;
  coordinates?: { lat: number; lng: number };
}

// İstifadəçi rolları üçün tip
export interface UserRole {
  id: string;
  user_id: string;
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Data entry status
export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// Profile
export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language?: Language;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'inactive' | 'blocked';
}

export type DatabaseRecord = Database['public']['Tables'];
