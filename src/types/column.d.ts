
import { Category } from './category';

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image';
export type ColumnStatus = 'active' | 'inactive' | 'draft';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  status: ColumnStatus;
  order_index?: number;
  validation?: ColumnValidation;
  options?: any[];
  default_value?: string;
  created_at: string;
  updated_at: string;
  parent_column_id?: string | null;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  status?: ColumnStatus;
  order_index?: number;
  validation?: ColumnValidation;
  options?: any[];
  default_value?: string;
  parent_column_id?: string | null;
}

export interface ColumnValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  requiredMessage?: string;
  patternMessage?: string;
  email?: boolean;
  url?: boolean;
  inclusion?: any[];
}

export interface ColumnValidationError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  entries?: any[];
  status: 'active' | 'inactive' | 'draft' | 'approved' | 'pending' | 'rejected' | 'partial';
  completionPercentage?: number;
}
