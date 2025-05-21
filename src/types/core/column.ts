
import { BaseEntity } from './index';

// Column type options
export type ColumnType = 
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'textarea'
  | 'file'
  | 'image'
  | 'boolean';

// Option for select-type columns
export interface ColumnOption {
  value: string;
  label: string;
  color?: string;
}

// Validation rules for columns
export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  patternError?: string;
  maxLength?: number;
  minLength?: number;
  dateMin?: string;
  dateMax?: string;
}

// Base column properties shared across the app
export interface BaseColumn {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;  // This is NOT optional in the core Column type
  default_value?: string;
  help_text?: string;
  placeholder?: string;
  order_index?: number;
  options?: ColumnOption[] | any;
  validation?: ColumnValidation | any;
  status?: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  section?: string;
  color?: string;
}

// Main Column interface used throughout the app
export interface Column extends BaseColumn {
  // Any column-specific extensions
}

// Form data structure for column operations
export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  category_id: string;
  help_text?: string;
  placeholder?: string;
  order_index?: number;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  default_value?: string;
  status?: string;
  description?: string;
  section?: string;
  color?: string;
}
