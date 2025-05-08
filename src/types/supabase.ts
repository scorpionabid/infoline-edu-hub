
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
