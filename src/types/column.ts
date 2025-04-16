
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
}
