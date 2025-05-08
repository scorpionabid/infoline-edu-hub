
export interface TabDefinition {
  id: string;
  label: string;
  content: React.ReactNode;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'email' | 'phone' | 'file' | 'image' | 'boolean';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id?: string;
  is_required?: boolean;
  order_index: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string | number | boolean;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  status?: string;
  created_at?: string;
  updated_at?: string;
  // Frontend specific properties
  label?: string;
  section?: string;
  parent_column_id?: string | null;
  conditional_display?: any | null;
}

export interface ColumnFormData {
  id?: string;
  name: string;
  type: ColumnType;
  category_id?: string;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  options?: ColumnOption[];
  default_value?: any;
  order_index?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  status?: string;
  priority?: number;
  column_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns extends Category {
  columns?: Column[];
  completionRate?: number;
  entries?: any[];
}

export interface CategoryFilter {
  search?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
