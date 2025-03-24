
// Supabase ilə işləmək üçün tiplər
// Bu tipləri Supabase client-i ilə istifadə edəcəyik

export type Region = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  status: string;
}

export type Sector = {
  id: string;
  region_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  status: string;
}

export type School = {
  id: string;
  name: string;
  principal_name: string | null;
  address: string | null;
  region_id: string;
  sector_id: string;
  phone: string | null;
  email: string | null;
  student_count: number | null;
  teacher_count: number | null;
  status: string;
  type: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
  completion_rate: number;
  logo: string | null;
  admin_email: string | null;
}

export type Category = {
  id: string;
  name: string;
  description: string | null;
  assignment: string;
  deadline: string | null;
  status: string;
  priority: number | null;
  created_at: string;
  updated_at: string;
}

export type Column = {
  id: string;
  category_id: string;
  name: string;
  type: string;
  is_required: boolean;
  placeholder: string | null;
  help_text: string | null;
  order_index: number | null;
  status: string;
  validation: any | null;
  default_value: string | null;
  options: any | null;
  created_at: string;
  updated_at: string;
}

export type DataEntry = {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
}
