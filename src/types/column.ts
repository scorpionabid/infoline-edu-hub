
import { Json } from '@/types/json';

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
  | 'image'
  | 'time'
  | 'datetime'
  | 'multiselect'
  | 'range'
  | 'color'
  | 'richtext'
  | 'tel';

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  description?: string;
}

export interface ColumnValidation {
  type?: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url';
  value?: string | number;
  message?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
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
  options?: ColumnOption[];
  validation?: ColumnValidation;
  description?: string;
  section?: string;
  color?: string;
  parent_column_id?: string;
  version?: number;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  description?: string;
  section?: string;
  validation?: ColumnValidation;
  options?: ColumnOption[];
  order_index?: number;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  validation?: Json;
  options?: Json;
  order_index?: number;
}

export const columnTypeDefinitions = [
  { value: 'text', label: 'Text', description: 'Single line text input', icon: '📝' },
  { value: 'textarea', label: 'Textarea', description: 'Multi-line text input', icon: '📄' },
  { value: 'number', label: 'Number', description: 'Numeric input', icon: '🔢' },
  { value: 'email', label: 'Email', description: 'Email address input', icon: '📧' },
  { value: 'phone', label: 'Phone', description: 'Phone number input', icon: '📞' },
  { value: 'url', label: 'URL', description: 'Website URL input', icon: '🔗' },
  { value: 'select', label: 'Select', description: 'Dropdown selection', icon: '📋' },
  { value: 'radio', label: 'Radio', description: 'Single choice selection', icon: '🔘' },
  { value: 'checkbox', label: 'Checkbox', description: 'Multiple choice selection', icon: '☑️' },
  { value: 'date', label: 'Date', description: 'Date picker input', icon: '📅' },
  { value: 'file', label: 'File', description: 'File upload input', icon: '📎' },
  { value: 'image', label: 'Image', description: 'Image upload input', icon: '🖼️' }
];
