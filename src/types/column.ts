
// Column types - enhanced with missing exports

export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'datetime-local'
  | 'time'
  | 'password'
  | 'select' 
  | 'multiselect' 
  | 'radio' 
  | 'checkbox' 
  | 'textarea' 
  | 'file'
  | 'boolean'
  | 'json'
  | 'switch';

export interface ColumnOption {
  id: string;
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

export interface ColumnValidation extends ValidationRules {
  message?: string;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  description?: string;
  order_index: number;
  status: 'active' | 'inactive' | 'deleted';
  options: ColumnOption[];
  validation: ValidationRules;
  default_value?: string;
  created_at: string;
  updated_at?: string;
  parent_column_id?: string;
  required?: boolean; // Compatibility alias for is_required
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  options: ColumnOption[];
  validation: ValidationRules;
  default_value?: string;
  order_index?: number;
}

export interface ColumnFormData extends ColumnFormValues {
  category_id: string;
  order_index?: number;
  status?: 'active' | 'inactive' | 'deleted';
}

// Missing exports that were causing build errors
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors' | 'schools';
  deadline?: string;
  status: 'active' | 'inactive' | 'draft' | 'deleted';
  priority: number;
  created_at: string;
  updated_at?: string;
  archived: boolean;
  column_count: number;
}

export interface CategoryWithColumns extends Category {
  columns?: Column[];
  completionPercentage?: number;
  columnCount?: number; // Compatibility alias
}
