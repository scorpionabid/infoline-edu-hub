
import { Session } from '@supabase/supabase-js';
import { User, UserRole } from './user';

export interface FullUserData extends User {
  full_name?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  language?: string;
  status?: string;
  last_login?: string | Date;
  lastLogin?: string | Date;
  created_at?: string | Date;
  createdAt?: string | Date;
  updated_at?: string | Date;
  updatedAt?: string | Date;
  adminEntity?: AdminEntity;
}

export interface AdminEntity {
  type?: string;
  name?: string;
  status?: string;
  schoolType?: string;
  sectorName?: string;
  regionName?: string;
  schoolName?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  region_name?: string;
  description?: string;
  status?: string;
  created_at: string | Date;
  updated_at?: string | Date;
}

export interface EnhancedSector extends Sector {
  school_count: number;
  completion_rate: number;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string | Date;
  updated_at?: string | Date;
}

export interface School {
  id: string;
  name: string;
  principal_name?: string;
  address?: string;
  region_id: string;
  region_name?: string;
  sector_id: string;
  sector_name?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  status?: string;
  type?: string;
  language?: string;
  created_at: string | Date;
  updated_at?: string | Date;
  completion_rate?: number;
  logo?: string;
  admin_email?: string;
  admin_id?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language?: string;
  last_login?: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
  status?: string;
  email?: string;
}

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';
