
// Define types for columns
export interface ColumnOption {
  id: string;
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'image' | string;

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status?: string;
  validation?: ColumnValidation | null;
  default_value?: string;
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  validation?: ColumnValidation;
  default_value?: string;
  options?: ColumnOption[];
  description?: string;
}
