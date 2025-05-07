
// School interface
export interface School {
  id: string;
  name: string;
  address?: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  status: string | 'active' | 'inactive';
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  completion_rate?: number;
  completionRate?: number;
  type?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  principal_name?: string;
  principalName?: string;
  logo?: string;
  lastUpdate?: string;
}

export interface AdminCreateData {
  name: string;
  email: string;
  password: string;
}

export type Region = {
  id: string;
  name: string;
  description?: string;
  status: string | 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
};

export type Sector = {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  region_name?: string;
  status: string | 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
  completion_rate?: number;
};

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  lastUpdate: string;
  pendingForms: number;
  principal?: string;
  principalName?: string;
  formsCompleted?: number;
  totalForms?: number; 
  address?: string;
  phone?: string;
  email?: string;
}

// SectorSchool tipini əlavə edək
export interface SectorSchool extends School {
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  completionRate?: number;
  principalName?: string;
  principal_name?: string;
}
