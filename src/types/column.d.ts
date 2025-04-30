
export interface BaseCategory {
  id: string;
  name: string;
  description?: string;
  target?: 'all' | 'sectors';
  priority: number;
  status: 'active' | 'inactive' | 'draft' | 'pending' | 'approved' | 'rejected' | 'partial';
  created_at?: string;
  updated_at?: string;
  deadline?: string;
  archived_at?: string;
}

export interface Category extends BaseCategory {
  column_count?: number;
  assignment?: 'all' | 'sectors';
}

export interface CategoryWithColumns extends BaseCategory {
  columns: Column[];
  completionPercentage?: number;
  status: 'active' | 'inactive' | 'draft' | 'pending' | 'approved' | 'rejected' | 'partial';
  entries?: any[];
  assignment?: 'all' | 'sectors';
}

export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox'
  | 'radio' 
  | 'file' 
  | 'image' 
  | 'textarea'
  | 'email' 
  | 'phone' 
  | 'url';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}

export interface ColumnValidationRule {
  type: string;
  message: string;
  value?: any;
}

export interface ColumnValidation {
  required?: boolean;
  requiredMessage?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  minMessage?: string;
  maxMessage?: string;
  pattern?: string;
  patternMessage?: string;
  rules?: ColumnValidationRule[];
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
  options?: ColumnOption[];
  validation?: ColumnValidation;
  default_value?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  parent_column_id?: string;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  default_value?: string;
  status: 'active' | 'inactive';
  parent_column_id?: string;
}

export interface ColumnValidationError {
  message: string;
  type: string;
}
