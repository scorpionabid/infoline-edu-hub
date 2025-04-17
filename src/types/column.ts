
import { Json } from './json';

export type ColumnType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'email' | 'phone' | 'url' | 'boolean';

export interface ColumnOption {
  label: string;
  value: string;
}

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
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  [key: string]: any;
}

export interface Column {
  id: string;
  name: string;
  category_id: string;
  type: ColumnType;
  is_required: boolean;
  order_index: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  status?: string;
  created_at: string;
  updated_at: string;
  parent_column_id?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  priority?: number;
  status?: string;
  created_at: string;
  updated_at: string;
  assignment?: string;
  column_count?: number;
  archived?: boolean;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}
