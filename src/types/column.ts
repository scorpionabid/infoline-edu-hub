
export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'date'
  | 'time'
  | 'email'
  | 'phone'
  | 'url';

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
  section?: string;
  key?: string;
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
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  order_index?: number;
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
  category_id?: string;
  section?: string;
  description?: string; // Əlavə etdik, səhv xətasını həll etmək üçün
}

export interface ColumnTypeDefinition {
  value: ColumnType;
  label: string;
  description: string;
  icon: string;
}

// Field Props Interface for components
export interface FieldProps {
  columnType: ColumnType;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id: string;
  name?: string;
  placeholder?: string;
  validation?: any;
  options?: ColumnOption[];
  onBlur?: () => void;
}
