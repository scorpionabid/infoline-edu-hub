
export interface Column {
  id: string;
  name: string;
  label?: string;
  description?: string;
  type: ColumnType;
  category_id: string;
  options?: ColumnOption[];
  is_required?: boolean;
  status?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
  validation?: ColumnValidation;
  section?: string;
  parent_column_id?: string;
  conditional_display?: {
    column_id: string;
    value: string | string[];
    operator: string;
  };
}

export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea'
  | 'file';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  description?: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface CategoryFilter {
  assignment?: string;
  status?: string;
  search?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  assignment?: string;
  status?: string;
  deadline?: string;
  completionRate?: number;
}
