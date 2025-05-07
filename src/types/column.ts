
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multiselect'
  | 'date' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea'
  | 'email'
  | 'url'
  | 'file'
  | 'image'
  | 'phone';

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  minValue?: number; // Added for value validation
  maxValue?: number; // Added for value validation
}

export interface ColumnValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  minValue?: number; // Added for value validation
  maxValue?: number; // Added for value validation
  customMessage?: string;
}

export interface ColumnOption {
  label: string;
  value?: string;
  disabled?: boolean;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  options?: ColumnOption[];
  validation?: ValidationRules;
  help_text?: string;
  placeholder?: string;
  default_value?: any;
  parent_column_id?: string;
  conditional_display?: any;
  status?: 'active' | 'inactive' | 'draft';
  created_at?: string;
  updated_at?: string;
}

export interface ColumnWithData extends Column {
  data?: any;
  value?: any;
  error?: string;
}

export interface ColumnWithOptions extends Column {
  options: ColumnOption[];
}

export interface ColumnWithValidation extends Column {
  validation: ValidationRules;
}

export interface ColumnTreeItem {
  column: Column;
  children: ColumnTreeItem[];
}
