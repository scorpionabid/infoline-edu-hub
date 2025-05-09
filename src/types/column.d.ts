
export type ColumnType = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'textarea' | 'file' | 'email' | 'url' | 'tel' | 'password' | 'checkbox' | 'radio' | 'range' | 'color';

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

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status: 'active' | 'inactive';
  validation?: ValidationRules;
  default_value?: string;
  options?: ColumnOption[];
  created_at?: string;
  updated_at?: string;
}

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  validation?: ValidationRules;
  options?: ColumnOption[];
  default_value?: string;
}
