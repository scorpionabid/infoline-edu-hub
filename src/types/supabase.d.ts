export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface CreateUserData {
  full_name: string;
  email: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
  avatar?: string;
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
  avatar?: string;
  password?: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  position?: string;
  language?: 'az' | 'en' | 'ru' | 'tr';
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  created_at?: string;
  updated_at?: string;
  email?: string;
  last_login?: string;
}

export interface School {
  id: string;
  name: string;
  sector_id?: string;
  region_id?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id?: string;
}

export interface Region {
  id: string;
  name: string;
  admin_id?: string;
  adminEmail?: string;
}

export interface FullUserData {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  phone?: string;
  position?: string;
  language?: 'az' | 'en' | 'ru' | 'tr';
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  school?: School | null;
  sector?: Sector | null;
  region?: Region | null;
  schoolId?: string | null;
  sectorId?: string | null;
  regionId?: string | null;
  school_id?: string | null;
  sector_id?: string | null;
  region_id?: string | null;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}
