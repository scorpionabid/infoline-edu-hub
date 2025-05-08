
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  order_index: number;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: any;
  validation?: ColumnValidation;
  status?: string;
  created_at?: string;
  updated_at?: string;
  label?: string;
  section?: string;
  parent_column_id?: string;
  conditional_display?: any;
}

export interface ColumnValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
  required?: boolean;
}

export interface ColumnFormData {
  id?: string;
  name: string;
  type: string;
  category_id: string;
  order_index?: number;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: any;
  validation?: ColumnValidation;
  status?: string;
  label?: string;
  section?: string;
}

export interface CategoryFilter {
  id: string;
  name: string;
  value: string;
  checked: boolean;
}

export type ColumnType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'date'
  | 'checkbox'
  | 'radio';

export interface TabDefinition {
  id: string;
  label: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  columns: Column[];
  completionRate?: number;
  entries?: any[];
}
