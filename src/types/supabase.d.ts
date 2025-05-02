
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  completion_rate?: number;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  email?: string;
  phone?: string;
  principal_name?: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
  type?: string;
  language?: string;
  student_count?: number;
  teacher_count?: number;
  logo?: string;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
}
