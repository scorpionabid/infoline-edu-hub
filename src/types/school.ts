
export type SchoolStatus = 'active' | 'inactive' | 'archived';

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  admin_id?: string | null;
  admin_email?: string;
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  logo?: string;
  status: SchoolStatus;
  language?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface SchoolFilter {
  search?: string;
  region_id?: string;
  sector_id?: string;
  status?: SchoolStatus;
}

export interface SectorSchool extends School {
  // Additional properties specific to sector admin view
  pendingForms?: number;
  lastUpdate?: string;
  completionRate?: number;
}

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
  region_id: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
}
