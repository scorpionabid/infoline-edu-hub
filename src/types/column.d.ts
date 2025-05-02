
export type ColumnType = 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'radio' | 'textarea';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  requiredMessage?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: string;
  pattern?: string;
  patternMessage?: string;
  inclusion?: string[];
  exclusion?: string[];
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface ColumnValidationError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  type: ColumnType;
  is_required: boolean;
  is_unique?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  created_at?: Date;
  updated_at?: Date;
  validation?: ColumnValidation;
  options?: ColumnOption[];
  order?: number;
  parent_id?: string;
  conditional_display?: object;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  status?: string;
  deadline?: Date;
  columns: Column[];
  created_at?: Date;
  updated_at?: Date;
  priority?: number;
  archived?: boolean;
}
