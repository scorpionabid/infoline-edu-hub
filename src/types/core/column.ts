
// Core column types
export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'phone' 
  | 'url'
  | 'password'
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'file';

export interface ColumnOption {
  label: string;
  value: string;
  description?: string;
}

export interface ColumnValidation {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url';
  value?: string | number;
  message?: string;
}

export interface BaseColumn {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  order_index?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Column extends BaseColumn {
  options?: ColumnOption[] | any;
  validation?: ColumnValidation[] | any;
  description?: string;
  section?: string;
  color?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation[];
  order_index?: number;
}
