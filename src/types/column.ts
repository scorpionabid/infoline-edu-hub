
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
  | 'file'
  | 'time'
  | 'datetime'
  | 'richtext'
  | 'range';

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface ColumnValidation {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'minLength' | 'maxLength' | 'minValue' | 'maxValue';
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
  key?: string;
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
  category_id?: string;
  description?: string;
  section?: string;
}

// Add ColumnFormData alias for backward compatibility
export type ColumnFormData = ColumnFormValues;

// Export column types array
export const columnTypes: ColumnType[] = [
  'text',
  'textarea', 
  'number',
  'email',
  'phone',
  'url',
  'password',
  'select',
  'checkbox',
  'radio',
  'date',
  'file',
  'time',
  'datetime',
  'richtext',
  'range'
];

// Props interface for BasicColumnFields
export interface BasicColumnFieldsProps {
  control: any;
  errors: any;
  watch: any;
}
