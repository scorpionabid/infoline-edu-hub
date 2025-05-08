
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  description?: string;
  is_required?: boolean;
  validation?: any;
  options?: string[];
  order?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  help_text?: string;
  placeholder?: string;
  order_index?: number;
  default_value?: string;
}

export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'date' 
  | 'file' 
  | 'textarea';

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  deadline?: string;
  status?: string;
  columns: Column[];
  completionRate: number;
  overallRate?: number;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  column_count?: number;
  priority?: number;
}

export interface TabDefinition {
  id: string;
  label: string;
  columns: Column[];
}

export interface CategoryFilter {
  name?: string;
  status?: string[];
  assignment?: string[];
  deadlineBefore?: Date;
  deadlineAfter?: Date;
}

export interface ColumnFormData {
  id?: string;
  name: string;
  type: string;
  category_id: string;
  description?: string;
  is_required?: boolean;
  validation?: any;
  options?: string[];
  order?: number;
  status?: string;
  help_text?: string;
  placeholder?: string;
}
