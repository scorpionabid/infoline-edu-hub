
export type ColumnType = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'email' | 'phone' | 'color' | 'tel' | 'url' | 'password' | 'range' | 'textarea' | 'multiselect' | 'richtext' | 'datetime';

export interface ColumnOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
}

export interface Column {
  id: string;
  name: string;
  help_text?: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  status?: string;
  placeholder?: string;
  default_value?: string;
  validation?: Record<string, any>;
  order_index?: number;
  options?: ColumnOption[] | null;
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface ColumnTypeMetadata {
  value: ColumnType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export interface ColumnTypeGroupMetadata {
  group: string;
  types: ColumnTypeMetadata[];
}

export const COLUMN_TYPES: ColumnType[] = [
  'text',
  'number',
  'boolean',
  'date',
  'datetime',
  'select',
  'multiselect',
  'checkbox',
  'radio',
  'file',
  'email',
  'phone',
  'color',
  'tel',
  'url',
  'password',
  'range',
  'textarea',
  'richtext'
];
