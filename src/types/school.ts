
// School related types

export interface School {
  id: string;
  name: string;
  principal_name?: string;
  region_id: string;
  sector_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  completion_rate?: number;
  logo?: string;
  admin_email?: string;
  admin_id?: string;
}

export interface Region {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
}
