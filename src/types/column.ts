
export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'date'
  | 'time';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required?: boolean;
  order_index?: number;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: any;
  validation?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
}

export interface ColumnWithValidation extends Column {
  validation: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
  };
}

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
  };
}

export interface ColumnTypeDefinition {
  value: ColumnType;
  label: string;
  description: string;
  icon: string;
}
