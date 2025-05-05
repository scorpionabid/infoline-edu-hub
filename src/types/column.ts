
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'image'
  | 'email'
  | 'link'
  | 'phone'
  | 'slider'
  | 'color'
  | 'time'
  | 'datetime'
  | 'textarea';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  message?: string;
}

export interface Column {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  type: ColumnType;
  order_index?: number;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOption[] | string;
  validation?: ColumnValidation;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  section?: string;
  related?: string[];
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  status?: string;
  columns?: Column[];
  completionRate?: number; // Bu xüsusiyyətin olduğundan əmin olun
  related?: string[];
  assignment?: 'all' | 'sectors';
}
