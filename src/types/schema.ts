
import { Json } from '@/types/supabase';

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface School {
  id: string;
  name: string;
  principal_name?: string;
  address?: string;
  region_id: string;
  sector_id: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  status?: string;
  type?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  completion_rate?: number;
  logo?: string;
  admin_email?: string;
  admin_id?: string;
}

export interface SchoolAdmin {
  id: string;
  email: string;
  name: string;
  status?: string;
  phone?: string;
  lastLogin?: string | null;
  avatar?: string | null;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: Record<string, any> | ColumnOption[];
  validation?: Record<string, any>;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'image';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}
