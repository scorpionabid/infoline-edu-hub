
export interface School {
  id: string;
  name: string;
  address?: string;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  phone?: string;
  email?: string;
  type?: string;
  language?: string;
  logo?: string;
  principal_name?: string;
  status?: 'active' | 'inactive' | 'blocked';
  student_count?: number;
  teacher_count?: number;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
  adminId?: string;
  admin_id?: string;
  adminEmail?: string;
  admin_email?: string;
  regionName?: string;
  sectorName?: string;
}

export interface SchoolFormData {
  name: string;
  regionId: string;
  sectorId: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
}

export interface SchoolAdmin {
  id: string;
  email: string;
  name?: string;
  status?: 'active' | 'inactive' | 'blocked';
  phone?: string;
  lastLogin?: string | null;
  avatar?: string | null;
}

export interface SchoolCreateParams {
  name: string;
  regionId: string;
  sectorId: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
}

export interface SchoolUpdateParams {
  id: string;
  name?: string;
  regionId?: string;
  sectorId?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
}
