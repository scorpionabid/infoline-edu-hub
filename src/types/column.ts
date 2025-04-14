
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
  minDate?: string;
  maxDate?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index: number;
  help_text?: string;
  placeholder?: string;
  options: ColumnOption[] | string[];
  validation: ValidationRules;
  default_value?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: string;
  priority: number;
  created_at: string;
  updated_at: string;
  archived: boolean;
  column_count: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}
