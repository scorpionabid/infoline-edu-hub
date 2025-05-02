
export type ColumnType = 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'file' | 'image';

export interface ColumnValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  min?: number;
  max?: number;
  required?: boolean;
  requiredMessage?: string;
  email?: boolean;
  url?: boolean;
  inclusion?: string[];
}

export interface ColumnOption {
  label: string;
  value: string;
}

export interface Column {
  id: string;
  name: string;
  category_id: string;
  type: ColumnType;
  description?: string;
  is_required?: boolean;
  default_value?: string;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status: string;
  columns: Column[];
  [key: string]: any;
}

export interface ColumnValidationError {
  column_id: string;
  message: string;
}
