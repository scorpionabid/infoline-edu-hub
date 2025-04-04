
// supabase.d.ts faylını genişləndirib çatışmayan interfeyslər əlavə edək

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' | string;
export type UserStatus = 'active' | 'inactive' | 'blocked' | string;

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

export interface User {
  id: string;
  email: string;
  full_name: string;
  name?: string; // Keçid uyğunluğu
  avatar?: string;
  phone?: string;
  position?: string;
  status: UserStatus;
  language: string;
  role?: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status: 'active' | 'inactive';
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  language?: string;
  type?: string;
  teacher_count?: number;
  student_count?: number;
  admin_email?: string;
  logo?: string;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
}

export interface Json {
  [key: string]: Json | string | number | boolean | null | Json[];
}

export interface SideBarNavItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items?: SideBarNavItem[];
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
    inApp?: boolean;
    push?: boolean;
  };
  twoFactorEnabled?: boolean;
  passwordResetDate?: string;
}

// Əsas tip tərifləri
