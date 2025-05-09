
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | string;

// Define the full user data structure with profile information
export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  position?: string;
  avatar?: string;
  role?: UserRole;
  region_id?: string;
  regionId?: string;  // Alias for region_id
  sector_id?: string;
  sectorId?: string;  // Alias for sector_id
  school_id?: string;
  schoolId?: string;  // Alias for school_id
  language?: string;
  status?: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  region_name?: string;
  regionName?: string;
  sector_name?: string;
  sectorName?: string;
  school_name?: string;
  schoolName?: string;
  metadata?: {
    notificationSettings?: {
      email: boolean;
      inApp: boolean;
      push: boolean;
      system: boolean;
      deadline: boolean;
    };
    [key: string]: any;
  };
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;  // Changed from 'active' | 'inactive' to string for compatibility
  created_at?: string;
  updated_at?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  status?: string;  // Changed from 'active' | 'inactive' to string for compatibility
  created_at?: string;
  updated_at?: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  status?: string;  // Changed from 'active' | 'inactive' to string for compatibility
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Column {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  options?: any;
  validation?: any;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar?: string;
  position?: string;
  phone?: string;
  language?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface EnhancedSector extends Sector {
  regionName?: string;
  schoolCount?: number;
  completionRate?: number;
}
