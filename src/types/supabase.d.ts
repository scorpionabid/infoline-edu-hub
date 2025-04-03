
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

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  role: UserRole;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
  last_login?: string;
  lastLogin?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
  twoFactorEnabled?: boolean;
  passwordResetDate?: string;
}

export type DbResult<T> = {
  data: T;
  error: PostgrestError | null;
};

// Burada School, Region, Sector və DataEntry kimi əsas modellər əlavə edirik ki, supabase ilə problemsiz inteqrasiya olsun
export type School = {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  status?: string;
  type?: string;
  language?: string;
  student_count?: number;
  teacher_count?: number;
  completion_rate?: number;
  admin_email?: string;
  logo?: string;
  created_at?: string;
  updated_at?: string;
};

export type Region = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
};

export type Sector = {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
};

export type DataEntry = {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
};
