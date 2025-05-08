
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  status: string;
  order_index?: number;
  default_value?: string;
  options?: any[] | Record<string, string>;
  validation?: ValidationRules;
  dependsOn?: DependsOnCondition;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'email' | 'phone' | 'file' | 'image' | 'url';

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  completionRate?: number;
  columns: Column[];
}

export interface CategoryWithEntries {
  id: string;
  name: string;
  description?: string;
  status?: string;
  completionRate: number;
  entries?: Record<string, any>;
  values?: Array<{columnId: string; value: any}>;
}

export interface TabDefinition {
  id: string;
  label: string;
  columns: Column[];
}

export interface CategoryFilter {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ColumnFormData {
  id?: string;
  name: string;
  type: string;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  status?: string;
  order_index?: number;
  default_value?: string;
  options?: any[] | Record<string, string>;
  validation?: ValidationRules;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
  minDate?: string;
  maxDate?: string;
  warningThreshold?: {
    min?: number;
    max?: number;
  };
}

export interface DependsOnCondition {
  columnId: string;
  condition: {
    type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
    value: any;
  };
}
