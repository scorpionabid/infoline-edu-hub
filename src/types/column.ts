
// Sütun tipləri

export const columnTypes = [
  'text',
  'number',
  'date',
  'time',
  'phone',
  'color',
  'checkbox',
  'radio',
  'select',
  'textarea',
  'image',
  'file',
  'password',
  'range',
  'datetime',
  'richtext',
  'email',
  'url'
] as const;

export type ColumnType = typeof columnTypes[number];

export interface ColumnOption {
  value: string;
  label: string;
  id?: string;
  color?: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  tel?: boolean;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
}

export interface ColumnValidation {
  min?: string;
  max?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  tel?: boolean;
  minDate?: string;
  maxDate?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  status: 'active' | 'inactive' | 'draft';
  order_index: number;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules;
  created_at?: string;
  updated_at?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder: string;
  help_text: string;
  status: string;
  order_index: number;
  default_value: string;
  options: ColumnOption[];
  validation: ColumnValidation;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status: string;
  deadline?: string | null;
  columns: Column[];
  completionRate?: number;
  column_count?: number;
  columnsCount?: number;
}

export interface CategoryFilter {
  status?: string;
  search?: string;
  sort?: string;
  assignment?: string;
}
