
// Column tiplərini təyin edir
export type ColumnType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date' | 'email' | 'url' | 'file';

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

export interface ColumnOption {
  value: string;
  label: string;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status: string;
  validation?: ValidationRules;
  default_value?: string;
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  deadline?: string;
  status: string;
  priority?: number;
  columns?: Column[];
  created_at: string;
  updated_at: string;
}

export type ColumnStatus = 'active' | 'inactive' | 'draft';
export type CategoryStatus = 'active' | 'inactive' | 'draft';
