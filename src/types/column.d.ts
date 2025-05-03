
export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  description?: string;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  is_required: boolean;
  options?: ColumnOption[] | string;
  order_index: number;
  status: 'active' | 'inactive';
  validation?: ColumnValidation | string;
  created_at: string;
  updated_at: string;
  parent_column_id?: string;
  dependencies?: string[];
  visibility_conditions?: any;
}

export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'image'
  | 'email'
  | 'url'
  | 'phone'
  | 'range'
  | 'color'
  | 'password'
  | 'time'
  | 'datetime'
  | 'richtext';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customError?: string;
  type?: string;
  value?: string | number;
  message?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  status: 'active' | 'inactive' | 'draft';
  priority?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  columns: Column[];
  entries?: DataEntry[];
  completionPercentage?: number;
}
