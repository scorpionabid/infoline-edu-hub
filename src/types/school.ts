
export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status: string;
  address?: string;
  email?: string;
  phone?: string;
  principal_name?: string;
  teacher_count?: number;
  student_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  totalForms?: number;
  formsCompleted?: number;
}

export interface SectorSchool {
  id: string;
  name: string;
  status: string;
  completion_rate?: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  status: string;
  completion_rate?: number;
  formsCompleted: number;
  totalForms: number;
}
