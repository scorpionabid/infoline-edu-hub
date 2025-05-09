
export type ColumnType = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'textarea' | 'file' | 'email' | 'url' | 'tel' | 'password' | 'checkbox' | 'radio' | 'range' | 'color' | 'richtext';

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
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status: string;
  validation?: ValidationRules;
  default_value?: string;
  options?: ColumnOption[];
  created_at?: string;
  updated_at?: string;
  description?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules;
  status?: string;
  description?: string;
  order_index?: number;
}

// Re-export Category from category.d.ts for compatibility
export { type Category } from '@/types/category';
