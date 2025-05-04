
import { Session, User } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  role?: UserRole;
  admin_entity?: any;
}

export interface UserRole {
  id?: string;
  user_id: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminEntity {
  type?: string;
  name?: string;
  status?: string;
  schoolType?: string;
  sectorName?: string;
  regionName?: string;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  role?: UserRole;
  avatar?: string;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
  last_login?: string | null;
  lastLogin?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  adminEntity?: AdminEntity;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
  twoFactorEnabled?: boolean;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
