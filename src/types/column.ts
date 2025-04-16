
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'file' 
  | 'image' 
  | 'time' 
  | 'email' 
  | 'url' 
  | 'phone' 
  | 'header' 
  | 'divider';

export interface ColumnOption {
  value: string;
  label: string;
  color?: string;
  disabled?: boolean;
}

export type ValidationRule = {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'customMessage';
  value?: number | string | boolean;
  message?: string;
};

export interface ValidationRules {
  required?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  email?: boolean | { message: string };
  url?: boolean | { message: string };
  customMessage?: string;
  minValue?: number | { value: number; message: string }; // Əlavə edildi
  maxValue?: number | { value: number; message: string }; // Əlavə edildi
}

export interface DependsOnCondition {
  columnId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
  value: string | number | boolean;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  help_text?: string;
  placeholder?: string;
  is_required?: boolean;
  options?: string[] | ColumnOption[];
  validation?: ValidationRules;
  default_value?: string;
  order_index?: number;
  status?: 'active' | 'inactive' | 'draft';
  dependsOn?: DependsOnCondition;
  created_at?: string;
  updated_at?: string;
  parent_column_id?: string | null; // Əlavə edildi
}

export interface ColumnFormData {
  id?: string;
  category_id: string;
  name: string;
  type: ColumnType;
  help_text?: string;
  placeholder?: string;
  is_required?: boolean;
  options?: string | ColumnOption[];
  validation?: ValidationRules;
  default_value?: string;
  order_index?: number;
  status?: 'active' | 'inactive' | 'draft';
  dependsOn?: DependsOnCondition;
  parent_column_id?: string | null; // Əlavə edildi
}

// Category tipini əlavə edirik
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'all' | 'sectors';
  deadline?: string;
  status?: 'active' | 'inactive' | 'draft';
  priority?: number;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  column_count?: number;
}

// CategoryWithColumns tipini əlavə edirik
export interface CategoryWithColumns extends Category {
  columns: Column[];
}

// DB-dən gələn column formatını uyğunlaşdırmaq üçün funksiya
export const adaptDbColumnToAppColumn = (dbColumn: any): Column => {
  return {
    id: dbColumn.id,
    category_id: dbColumn.category_id,
    name: dbColumn.name,
    type: dbColumn.type,
    is_required: dbColumn.is_required,
    help_text: dbColumn.help_text,
    placeholder: dbColumn.placeholder,
    options: dbColumn.options,
    validation: dbColumn.validation,
    default_value: dbColumn.default_value,
    order_index: dbColumn.order_index,
    status: dbColumn.status || 'active',
    created_at: dbColumn.created_at,
    updated_at: dbColumn.updated_at,
    parent_column_id: dbColumn.parent_column_id
  };
};
