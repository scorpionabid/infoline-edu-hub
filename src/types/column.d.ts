
// Column types
export type ColumnType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'range'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime'
  | 'email'
  | 'url'
  | 'phone'
  | 'color'
  | 'password'
  | 'file'
  | 'image';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  tel?: boolean;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string | number | boolean;
  options: ColumnOption[];
  validation?: ColumnValidation;
  status?: 'active' | 'inactive';
  description?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options: ColumnOption[];
  validation?: ColumnValidation;
  status?: 'active' | 'inactive';
  description?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  columns: Column[];
}
