
// Supabase ilə əlaqəli əsas tiplər

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  region_id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  principal_name?: string;
  address?: string;
  region_id: string;
  sector_id: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  status?: string;
  type?: string;
  language?: string;
  created_at: string;
  updated_at: string;
  completion_rate?: number;
  logo?: string;
  admin_email?: string;
  admin_id?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role?: UserRole;
  region_id?: string;
  region_name?: string;
  sector_id?: string;
  sector_name?: string;
  school_id?: string;
  schoolName?: string;
  status?: string;
  created_at?: string;
  last_login?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language?: string;
  name?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
}
