
export type SchoolStatus = 'active' | 'inactive';

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status: SchoolStatus;
  created_at: string;
  updated_at: string;
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  language?: string;
  student_count?: number;
  teacher_count?: number;
  completion_rate?: number;
  admin_id?: string;
  admin_email?: string;
  logo?: string;
}

export interface Region {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_id?: string;
  admin_email?: string;
  description?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_id?: string;
  admin_email?: string;
  description?: string;
  completion_rate?: number;
}
