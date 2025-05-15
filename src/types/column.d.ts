
export type ColumnType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 
  'checkbox' | 'radio' | 'file' | 'email' | 'phone' | 'color' | 'tel' | 
  'url' | 'password' | 'range' | 'textarea' | 'multiselect' | 'richtext' | 'datetime';

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  date?: boolean;
  custom?: string;
  minDate?: string;
  maxDate?: string;
  tel?: boolean;
  [key: string]: any;
}

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType | string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status: string;
  validation?: ValidationRules;
  default_value?: string | number | boolean;
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
  description?: string;
  color?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  columns: Column[];
  deadline?: string;
  assignment?: string;
  completionRate?: number;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: Record<string, any>;
  status?: string;
  description?: string;
  order_index?: number;
}

export { type Category } from '@/types/category';
