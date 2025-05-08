
export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  completionRate: number;
  columns?: Column[];
}

export interface CategoryWithEntries {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  completionRate: number;
  entries?: CategoryEntryData[];
}

export interface CategoryEntryData {
  id: string;
  columnId: string;
  value: string;
  status: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  placeholder?: string;
  help_text?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  default_value?: string;
}

export interface ColumnOption {
  value: string;
  label: string;
}

export interface ColumnValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface TabDefinition {
  id: string;
  label: string;
  columns: Column[];
}

export interface CategoryFilter {
  id: string;
  name: string;
  value: string;
}

export interface ColumnFormData {
  name: string;
  type: string;
  category_id: string;
  is_required: boolean;
  order_index: number;
  placeholder?: string;
  help_text?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  default_value?: string;
}

export type ColumnType = 
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'email'
  | 'phone'
  | 'url';
