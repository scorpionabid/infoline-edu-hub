
import { Category } from "@/types/category";

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'textarea' | 'email' | 'phone' | 'multiselect';

export interface ColumnOption {
  value: string;
  label: string;
}

export interface ColumnValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  patternMessage?: string;
  warningThreshold?: number | { min?: number; max?: number };
  minDate?: string;
  maxDate?: string;
  options?: string[] | ColumnOption[];
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  categoryId: string;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  orderIndex: number;
  options: string[] | ColumnOption[];
  validation?: ColumnValidation;
  status: string;
  order?: number;
  parentColumnId?: string;
  dependsOn?: string;
}

export interface CategoryWithColumns {
  category: Category;
  columns: Column[];
  id?: string;
  name?: string;
  deadline?: string;
}

// Supabase column-ni adaptasiya etmək üçün funksiya
export const adaptSupabaseColumn = (column: any): Column => {
  // Parse options array if it's a string
  let parsedOptions = column.options;
  if (typeof column.options === 'string') {
    try {
      parsedOptions = JSON.parse(column.options);
    } catch (e) {
      parsedOptions = [];
    }
  }

  // Parse validation object if it's a string
  let parsedValidation = column.validation;
  if (typeof column.validation === 'string') {
    try {
      parsedValidation = JSON.parse(column.validation);
    } catch (e) {
      parsedValidation = {};
    }
  }

  return {
    id: column.id,
    name: column.name,
    type: column.type as ColumnType,
    categoryId: column.category_id,
    isRequired: column.is_required !== false,
    placeholder: column.placeholder || '',
    helpText: column.help_text || '',
    defaultValue: column.default_value || '',
    orderIndex: column.order_index || 0,
    options: Array.isArray(parsedOptions) ? parsedOptions : [],
    validation: parsedValidation || {},
    status: column.status || 'active',
    order: column.order_index || 0,
    parentColumnId: column.parent_column_id,
    dependsOn: column.depends_on,
  };
};

// SupaBase üçün column-ni düzənləmə
export const adaptColumnToSupabase = (column: Column) => {
  return {
    name: column.name,
    category_id: column.categoryId,
    type: column.type,
    is_required: column.isRequired,
    placeholder: column.placeholder || null,
    help_text: column.helpText || null,
    default_value: column.defaultValue || null,
    order_index: column.orderIndex,
    options: JSON.stringify(column.options || []),
    validation: JSON.stringify(column.validation || {}),
    status: column.status,
    parent_column_id: column.parentColumnId || null,
    depends_on: column.dependsOn || null,
  };
};
