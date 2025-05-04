
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

// AdminEntity interfeysi
export interface AdminEntity {
  type?: string;
  name?: string;
  status?: string;
  schoolType?: string;
  sectorName?: string;
  regionName?: string;
  schoolName?: string;
}

export interface FullUserData {
  id: string;
  email?: string;
  full_name?: string;
  name?: string; // Alias for full_name
  role?: UserRole;
  region_id?: string;
  regionId?: string; // Alias for region_id
  sector_id?: string;
  sectorId?: string; // Alias for sector_id
  school_id?: string;
  schoolId?: string; // Alias for school_id
  status?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  created_at?: string;
  createdAt?: string; // Alias for created_at
  updated_at?: string;
  updatedAt?: string; // Alias for updated_at
  last_login?: string;
  lastLogin?: string; // Alias for last_login
  adminEntity?: AdminEntity; // Admin entity məlumatları
}

export type Language = 'az' | 'en' | 'ru' | 'tr';
