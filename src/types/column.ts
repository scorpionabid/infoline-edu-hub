
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'email' 
  | 'phone' 
  | 'file' 
  | 'image';

export type ColumnStatus = 'active' | 'inactive' | 'draft';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status?: ColumnStatus;
  validation?: ValidationRules;
  default_value?: string;
  options?: any;
  parent_column_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ColumnOption {
  value: string;
  label: string;
}

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minValue?: number; // Əlavə edildi
  maxValue?: number; // Əlavə edildi
  pattern?: string | RegExp;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  date?: boolean;
  custom?: string;
}

export interface ColumnValidationError {
  field: string;
  message: string;
  type: string;
  severity?: 'warning' | 'error' | 'info';
}

export interface ColumnFormData extends Omit<Column, 'validation' | 'options'> {
  validation: ValidationRules;
  options: ColumnOption[];
}
