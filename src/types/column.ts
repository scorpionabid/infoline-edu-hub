
export enum ColumnType {
  TEXT = 'text',
  TEXTAREA = 'textarea', 
  NUMBER = 'number',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SWITCH = 'switch',
  DATE = 'date',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  PASSWORD = 'password',
  FILE = 'file'
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  description?: string;
  section?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: any;
  order_index: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ColumnOption {
  value: string;
  label: string;
  disabled?: boolean;
  id?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  description?: string;
  section?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: any;
  order_index: number;
  category_id?: string;
}

export interface ColumnTypeDefinition {
  value: ColumnType;
  label: string;
  description?: string;
  icon?: string;
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
