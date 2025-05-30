
import { ColumnType } from './column';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status: 'active' | 'inactive' | string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    required?: boolean;
  };
  default_value?: string;
  options?: ColumnOption[];
  created_at?: string;
  updated_at?: string;
  deadline?: Date;
  section?: string;
}

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}

export interface ColumnValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  errorMessage?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: string;
  status: string;
  deadline?: string;
  columns: Column[];
  created_at?: string;
  updated_at?: string;
  completionRate?: number;
}
