
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
