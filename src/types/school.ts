
export interface School {
  id: string;
  name: string;
  address?: string;
  sector_id: string;
  region_id: string;
  status: 'active' | 'inactive';
  student_count?: number;
  teacher_count?: number;
  phone?: string;
  email?: string;
  director_name?: string;
  admin_email?: string;
  admin_id?: string;
  contact_phone?: string;
  type?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  sector_name?: string;
  region_name?: string;
  completion_rate?: number;
}

export interface SchoolFormData {
  name: string;
  address?: string;
  sector_id: string;
  region_id?: string;
  status: 'active' | 'inactive';
  student_count?: number;
  teacher_count?: number;
  phone?: string;
  email?: string;
  director_name?: string;
  admin_email?: string;
  contact_phone?: string;
  type?: string;
  language?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  formsCompleted: number;
  totalForms: number; 
  completionRate: number;
  status?: string;
  address?: string;
}
