
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
  required?: boolean; // İstifadə edilən field
  minLength?: number;
  maxLength?: number;
  requiredMessage?: string; // İstifadə edilən field
  patternMessage?: string; // İstifadə edilən field
}

export interface ColumnValidationError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'sectors' | 'all';
  deadline?: string | Date;
  status: 'active' | 'inactive' | 'draft';
  priority?: number;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  entries?: any[];
  status: 'active' | 'inactive' | 'draft' | 'approved' | 'pending' | 'rejected' | 'partial';
  completionPercentage?: number;
}
