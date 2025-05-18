
export type ColumnType = 
  'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'checkbox' | 
  'radio' | 'date' | 'time' | 'datetime' | 'file' | 'image' | 'email' | 'phone' | 'tel' | 'url' | 'password' | 
  'color' | 'range' | 'richtext';

export interface Column {
  id: string;
  category_id: string;  // This should be required for consistency
  name: string;
  type: ColumnType | string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  status?: string;
  section?: string;
  description?: string;
  color?: string;
}

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  color?: string;
  description?: string;
  disabled?: boolean;
}

export interface ColumnValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  errorMessage?: string;
  patternMessage?: string;
}

export interface ColumnFormData {
  id?: string;
  category_id: string;
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
