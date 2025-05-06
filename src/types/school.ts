
export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status?: string;
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  completion_rate?: number;
  logo?: string;
  admin_id?: string;
  admin_email?: string;
  adminEmail?: string; // Uyğunluq üçün
}

export interface SchoolFormData {
  name: string;
  region_id: string;
  sector_id: string;
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive';
}
