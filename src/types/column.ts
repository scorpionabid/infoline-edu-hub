
import { Json } from './supabase';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  order_index: number;
  placeholder?: string;
  help_text?: string;
  options?: any;
  validation?: ColumnValidation;
  default_value?: any;
  status: string;
  created_at?: string;
  updated_at?: string;
  parent_column_id?: string;
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customMessage?: string;
}

export type ColumnType = 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'textarea' | 'radio' | 'file';

export type ColumnOption = {
  label: string;
  value: string | number;
};

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'all' | 'sectors';
  deadline?: string;
  status?: string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  completionPercentage?: number;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  is_required: boolean;
  order_index: number;
  placeholder?: string;
  help_text?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  default_value?: any;
  status: 'active' | 'inactive' | 'draft';
  parent_column_id?: string;
}
