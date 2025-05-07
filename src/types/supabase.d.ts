
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | string;
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
  status: 'active' | 'inactive' | string;
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
  status: 'active' | 'inactive' | string;
  logo?: string;
  principal_name?: string;
  principalName?: string; // TypeScript camelCase alias
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
  pendingForms?: number; 
  completionRate?: number;
  principal?: string;
  principalName?: string; // TypeScript camelCase alias
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
