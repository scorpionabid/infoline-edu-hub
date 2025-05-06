
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
  completion_rate?: number;
}

export interface School {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
  logo?: string;
  principal_name?: string;
  type?: string;
  teacher_count?: number;
  student_count?: number;
  language?: string;
  completion_rate?: number;
}

export interface SchoolStat extends School {
  completion_rate: number;
  formsTotal: number;
  formsCompleted: number;
  formsPending: number;
  lastUpdate: string;
}

export interface UserReported {
  id: string;
  email: string;
  name: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  created_at: string;
}
