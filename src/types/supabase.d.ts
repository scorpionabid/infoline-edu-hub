
export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  avatar?: string;
  language?: string;
  status: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
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
  admin_id?: string;
  admin_email?: string;
  status: string;
  completion_rate?: number;
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
  language?: string;
  logo?: string;
  status: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}
