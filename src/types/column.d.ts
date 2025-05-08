
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id?: string;
  is_required?: boolean;
  order_index?: number;
  status?: string;
  help_text?: string;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  default_value?: any;
  options?: string[] | {label: string; value: string}[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  priority?: number;
  column_count?: number;
  created_at?: string;
  updated_at?: string;
  completionRate?: number;
}

export interface CategoryWithColumns extends Category {
  columns?: Column[];
  completionRate?: number;
}

export interface TabDefinition {
  id: string;
  label: string;
  columns: Column[];
}

export interface CategoryFilter {
  status?: string;
  deadline?: string;
  search?: string;
  date?: string | Date;
}

export interface ColumnFormData {
  id?: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  status?: string;
  help_text?: string;
  placeholder?: string;
  validation?: any;
  default_value?: any;
  options?: any[];
}
