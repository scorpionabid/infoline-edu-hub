
export interface School {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  principal_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  sector_id: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}
