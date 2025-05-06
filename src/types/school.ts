
export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  contact_phone?: string; // Bu xüsusiyyəti əlavə etdik
  email?: string;
  principal_name?: string;
  teacher_count?: number;
  student_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  status?: 'active' | 'inactive';
  completion_rate?: number;
  admin_id?: string;
  admin_email?: string;
  adminEmail?: string; // Əlavə et - uyğunluq üçün
  created_at?: string;
  updated_at?: string;
}
