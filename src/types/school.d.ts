
export interface School {
  id: string;
  name: string;
  principal_name?: string;
  principalName?: string;
  address?: string;
  region_id: string;
  region_name?: string;
  sector_id: string;
  sector_name?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  status: string;
  type?: string;
  language?: string;
  created_at: string | Date;
  updated_at?: string | Date;
  completion_rate?: number;
  logo?: string;
  admin_email?: string;
  admin_id?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string | Date;
  updated_at?: string | Date;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string | Date;
  updated_at?: string | Date;
  status: string;
  completion_rate?: number;
}

export interface SectorSchool {
  id: string;
  name: string;
  principal_name?: string;
  completionRate?: number;
  status: string;
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
}
