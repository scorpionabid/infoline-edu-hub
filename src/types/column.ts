
export type ColumnType = 
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'image'
  | 'currency'
  | 'percentage';

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  [key: string]: string | boolean | undefined;
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
  step?: number;
  custom?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  section?: string;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules;
  order_index?: number;
  section?: string;
  status?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules;
  order_index?: number;
  section?: string;
  status?: string;
}
