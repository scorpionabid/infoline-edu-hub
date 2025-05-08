
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
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
  completion_rate?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  logo?: string;
  language?: string;
  status?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}
