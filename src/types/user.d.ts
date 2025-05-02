
import { UserRole } from './supabase';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}
