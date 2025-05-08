
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id?: string;
  order_index?: number;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  options?: any;
  default_value?: string;
  validation?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: number;
  deadline?: string;
  created_at?: string;
  updated_at?: string;
  assignment?: string;
  archived?: boolean;
  column_count?: number;
  columns: Column[];
  completionRate?: number;
}

export interface CategoryFilter {
  status?: string;
  assignment?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TabDefinition {
  id: string;
  label: string;
}

export interface ColumnFormData {
  id?: string;
  name: string;
  type: string;
  category_id?: string;
  order_index?: number;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  options?: any;
  default_value?: string;
  validation?: any;
  status?: string;
}

export interface CategoryWithEntries extends CategoryWithColumns {
  entries?: any[];
  completionRate?: number;
}

export interface CategoryEntryData {
  id?: string;
  category_id: string;
  column_id: string;
  value: string;
  status?: string;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'file' | 'textarea';
