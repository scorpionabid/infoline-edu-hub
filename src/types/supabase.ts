
// Supabase üçün tiplər
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language?: 'az' | 'en' | 'ru' | 'tr';
  status?: 'active' | 'inactive' | 'blocked';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
  status?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at?: string;
  status?: string;
  completion_rate?: number;
}

export interface EnhancedSector extends Sector {
  regionName?: string;
  adminName?: string;
  schoolCount?: number;
  completionRate?: number;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  principal_name?: string;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  completion_rate?: number;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  avatar?: string;
  role?: string;
  status?: string;
  phone?: string;
  position?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  region_id?: string;
  regionId?: string;
  region_name?: string;
  regionName?: string;
  sector_id?: string;
  sectorId?: string;
  sector_name?: string;
  sectorName?: string;
  school_id?: string;
  schoolId?: string;
  school_name?: string;
  schoolName?: string;
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  };
}
