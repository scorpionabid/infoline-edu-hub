
export type SchoolStatus = 'active' | 'inactive' | 'pending' | 'archived';

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  status: SchoolStatus;
  completion_rate?: number;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  status: SchoolStatus;
  region_id: string;
  sector_id: string;
  admin_email?: string;
}

export interface SchoolFilter {
  status?: SchoolStatus;
  region_id?: string;
  sector_id?: string;
  search?: string;
}

export interface SchoolStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  completion_rate: number;
}

// Add missing Region and Sector interfaces
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  status: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  status: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

// School creation specific types
export interface CreateSchoolData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  status: 'active' | 'inactive';
  region_id: string;
  sector_id: string;
  admin_email?: string;
}
