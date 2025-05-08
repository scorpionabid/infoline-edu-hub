
export interface Column {
  id: string;
  name: string;
  category_id: string;
  type: ColumnType;
  order_index?: number;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOptions;
  validation?: ColumnValidation;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'date' 
  | 'checkbox' 
  | 'radio' 
  | 'file';

export interface ColumnOptions {
  choices?: string[];
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
}

export interface TabDefinition {
  id: string;
  label: string;
  description?: string;
  columns: Column[];
}
