
import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string | null;
  admin_email?: string | null;
}

export interface Sector {
  id: string;
  region_id: string;
  name: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string | null;
  admin_email?: string | null;
}

export interface School {
  id: string;
  sector_id: string;
  region_id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRole;
  created_at?: string;
  school_id?: string | null;
  sector_id?: string | null;
  region_id?: string | null;
}

export interface ExtendedUser extends SupabaseUser {
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
