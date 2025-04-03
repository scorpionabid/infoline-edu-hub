
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
  password?: string;
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

// RoleObject interfeysi əlavə edək
export interface RoleObject {
  id: string;
  user_id: string;
  role: string;
  region_id: string;
  sector_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface FullUserData {
  id: string;
  email: string;
  role: UserRole; // Changed from UserRole | RoleObject to just UserRole
  full_name?: string;
  name?: string;
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
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
  passwordResetDate?: string; // Add this for EditUserDialog
  // User interfeysi ilə uyğunlaşmaq üçün əlavə edilmiş xüsusiyyətlər
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
}

// DataEntry interfeysi əlavə edirik
export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  version_history_id?: string;
}
