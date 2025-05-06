
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

export type Supabase = SupabaseClient;

export interface SessionUser extends SupabaseUser {
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
