
export interface Column {
  id: string;
  name: string;
  label?: string;
  description?: string;
  type: ColumnType;
  category_id: string;
  options?: ColumnOption[];
  is_required?: boolean;
  status?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
  validation?: ColumnValidation;
  section?: string;
  parent_column_id?: string;
  help_text?: string;
  placeholder?: string;
  default_value?: string | number | boolean;
  order_index?: number;
  conditional_display?: {
    column_id: string;
    value: string | string[];
    operator: string;
  };
}

export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea'
  | 'file'
  | 'email'
  | 'phone'
  | 'image'
  | 'datetime'
  | 'time'
  | 'url'
  | 'color'
  | 'password'
  | 'richtext'
  | 'range'
  | 'boolean';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  description?: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  email?: boolean;
  url?: boolean;
  tel?: boolean;
  minDate?: string;
  maxDate?: string;
  minValue?: number;
  maxValue?: number;
}

export interface CategoryFilter {
  assignment?: string;
  status?: string;
  search?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  assignment?: string;
  status?: string;
  deadline?: string;
  completionRate?: number;
}

// Define TabDefinition interface for CategoryForm
export interface TabDefinition {
  id: string;
  title: string;
  columns: Column[];
}
