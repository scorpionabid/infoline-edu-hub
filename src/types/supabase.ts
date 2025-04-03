
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  status: string;
  avatar: string;
  phone: string;
  position: string;
  language: string;
  last_login: string;
  created_at: string;
  updated_at: string;
};

export interface FullUserData extends Profile {
  name?: string;
  role: UserRole;
  regionId?: string;
  region_id?: string;
  sectorId?: string;
  sector_id?: string;
  schoolId?: string;
  school_id?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: any;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  passwordResetDate?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'inactive';
  // Əlavə uyğunluq üçün
  adminId?: string;
  adminEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'inactive';
  // Əlavə uyğunluq üçün
  adminEmail?: string;
  regionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  principal_name?: string;
  email?: string;
  phone?: string;
  student_count?: number;
  teacher_count?: number;
  status?: 'active' | 'inactive';
  type?: string;
  language?: string;
  logo?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
  // Əlavə uyğunluq üçün
  regionId?: string;
  sectorId?: string;
  principalName?: string;
  studentCount?: number;
  teacherCount?: number;
  adminEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: DataEntryStatus;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export type DataEntryStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'submitted';
