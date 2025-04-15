
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'textarea';

export interface ColumnOption {
  value: string;
  label: string;
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

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  order_index: number;
  status: 'active' | 'inactive' | 'draft';
  validation: ValidationRules | any;
  default_value?: string;
  placeholder?: string;
  help_text?: string;
  options: string[] | ColumnOption[];
  created_at: string;
  updated_at: string;
  parent_column_id?: string;
  dependsOn?: DependsOnCondition;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
  columns: Column[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
}

// Database-dən gələn sütunu tətbiq sütununa çevirmək üçün funksiya
export const adaptDbColumnToAppColumn = (dbColumn: any): Column => {
  return {
    id: dbColumn.id,
    category_id: dbColumn.category_id,
    name: dbColumn.name,
    type: dbColumn.type as ColumnType,
    is_required: dbColumn.is_required,
    order_index: dbColumn.order_index,
    status: dbColumn.status as 'active' | 'inactive' | 'draft',
    validation: dbColumn.validation,
    default_value: dbColumn.default_value,
    placeholder: dbColumn.placeholder,
    help_text: dbColumn.help_text,
    options: Array.isArray(dbColumn.options) ? dbColumn.options : [],
    created_at: dbColumn.created_at,
    updated_at: dbColumn.updated_at,
    parent_column_id: dbColumn.parent_column_id
  };
};

// Sütun adapteri funksiyaları
export const adaptColumnToSupabase = (column: Partial<Column>) => {
  return {
    name: column.name,
    category_id: column.category_id,
    type: column.type,
    is_required: column.is_required,
    order_index: column.order_index,
    status: column.status,
    validation: column.validation,
    default_value: column.default_value,
    placeholder: column.placeholder,
    help_text: column.help_text,
    options: column.options,
    parent_column_id: column.parent_column_id
  };
};
