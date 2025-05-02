
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  email?: string;
  phone?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  status: string;
  language?: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface FullUserData {
  id: string;
  email?: string;
  full_name?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export type Language = 'az' | 'en' | 'ru' | 'tr';
