
export interface Column {
  id: string;
  category_id?: string;
  name: string;
  type: string;
  status?: string;
  is_required?: boolean;
  default_value?: string;
  help_text?: string;
  placeholder?: string;
  order_index?: number;
  options?: any;
  validation?: any;
  created_at?: string;
  updated_at?: string;
  section?: string;
}

export interface ColumnOption {
  value: string;
  label: string;
}

export interface ColumnValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export type ColumnType = 
  | 'text'
  | 'number' 
  | 'select'
  | 'multiselect'
  | 'date'
  | 'textarea'
  | 'checkbox'
  | 'radio';

export interface ColumnFormData {
  id?: string;
  category_id?: string;
  name: string;
  type: ColumnType;
  status?: string;
  is_required: boolean;
  default_value?: string;
  help_text?: string;
  placeholder?: string;
  order_index?: number;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  section?: string;
}
