
export enum ColumnType {
  TEXT = 'text',
  TEXTAREA = 'textarea', 
  NUMBER = 'number',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  SWITCH = 'switch',
  DATE = 'date',
  EMAIL = 'email'
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: any[];
  validation?: any;
  order_index: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ColumnOption {
  value: string;
  label: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  status: 'active' | 'inactive';
  priority?: number;
  deadline?: string;
  column_count: number;
  columns: Column[];
  created_at: string;
  updated_at: string;
}
