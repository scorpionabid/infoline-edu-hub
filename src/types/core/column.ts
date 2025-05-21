
import { BaseEntity, JsonObject, JsonArray } from './index';

/**
 * Core Column type definitions
 */

export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'time'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'email'
  | 'phone'
  | 'url'
  | 'password'
  | 'color'
  | 'file'
  | 'image'
  | 'richtext'
  | 'range';

// Common interface for column options
export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
  description?: string;
}

// Validation rules that can be applied to columns
export interface ColumnValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
  errorMessage?: string;
  patternMessage?: string;
  [key: string]: any; // Allow additional validation rules
}

// Base column interface - the core properties that all column implementations must have
export interface BaseColumn extends BaseEntity {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index: number;
  status?: string;
}

// A complete column with all optional fields
export interface Column extends BaseColumn {
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  description?: string;
  section?: string;
  color?: string;
}

// Form data for creating/editing columns
export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  validation?: ColumnValidation;
  options?: ColumnOption[];
  order_index?: number;
  description?: string;
  section?: string;
  color?: string;
}
