
export interface School {
  id: string;
  name: string;
  address?: string;
  region_id: string;
  sector_id: string;
  status?: string;
  principal_name?: string;
  phone?: string;
  email?: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  completion_rate?: number;
}

export interface SchoolFormData {
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  admin_email?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive';
}

export interface SchoolStat {
  id: string;
  name: string;
  formsCompleted: number;
  totalForms: number;
  completionRate: number;
  status: string;
}
