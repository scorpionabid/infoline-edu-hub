
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'email' | 'phone';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id?: string;
  is_required?: boolean;
  order_index?: number;
  status?: string;
  help_text?: string;
  placeholder?: string;
  validation?: any;
  default_value?: any;
  options?: string[] | {label: string; value: string}[];
  created_at?: string;
  updated_at?: string;
  dependsOn?: any;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus;
  deadline?: string | Date;
  priority?: number;
  column_count?: number;
  created_at?: string;
  updated_at?: string;
  completionRate?: number;
  assignment?: CategoryAssignment;
  archived?: boolean;
}

export interface CategoryWithColumns extends Category {
  columns?: Column[];
  completionRate?: number;
  assignment?: CategoryAssignment;
}

export interface TabDefinition {
  id: string;
  label: string;
  columns: Column[];
}

export interface CategoryFilter {
  status?: string;
  deadline?: string;
  search?: string;
  date?: string | Date;
  assignment?: string;
}

export interface ColumnFormData {
  id?: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  status?: string;
  help_text?: string;
  placeholder?: string;
  validation?: any;
  default_value?: any;
  options?: any[];
}

export interface ValidationRules {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
  warningThreshold?: {
    min?: number;
    max?: number;
  };
  minDate?: string;
  maxDate?: string;
  required?: boolean;
}

export interface DependsOnCondition {
  columnId: string;
  condition: {
    type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
    value: any;
  };
}

export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved';
export type CategoryAssignment = 'all' | 'sectors';
