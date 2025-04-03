
import { Category } from './category';

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image';

export interface Column {
  id: string;
  name: string;
  categoryId: string;
  type: string;
  isRequired: boolean;
  orderIndex: number;
  order: number;
  status: string;
  options?: string[];
  helpText?: string;
  placeholder?: string;
  validationRules?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    minValue?: number;
    maxValue?: number;
  };
  defaultValue?: string;
  parentColumnId?: string;
  dependsOn?: string;
  validation?: any;
}

export interface ColumnOption {
  label: string;
  value: string;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

// Supabase-dən gələn sütun datasını tətbiqin daxilindəki Column tipinə çevirir
export const adaptSupabaseColumn = (supabaseColumn: any): Column => {
  return {
    id: supabaseColumn.id,
    name: supabaseColumn.name,
    categoryId: supabaseColumn.category_id,
    type: supabaseColumn.type || 'text',
    isRequired: supabaseColumn.is_required !== false,
    orderIndex: supabaseColumn.order_index || 0,
    order: supabaseColumn.order || 0,
    status: supabaseColumn.status || 'active',
    options: supabaseColumn.options || [],
    helpText: supabaseColumn.help_text || '',
    placeholder: supabaseColumn.placeholder || '',
    validationRules: supabaseColumn.validation || {},
    defaultValue: supabaseColumn.default_value || '',
    parentColumnId: supabaseColumn.parent_column_id,
    dependsOn: supabaseColumn.depends_on,
    validation: supabaseColumn.validation
  };
};

// Tətbiqdəki Column tipindən Supabase formatına çevirir
export const adaptColumnToSupabase = (column: Partial<Column>): Record<string, any> => {
  return {
    id: column.id,
    name: column.name,
    category_id: column.categoryId,
    type: column.type,
    is_required: column.isRequired,
    order_index: column.orderIndex,
    order: column.order,
    status: column.status,
    options: column.options,
    help_text: column.helpText,
    placeholder: column.placeholder,
    validation: column.validationRules || column.validation,
    default_value: column.defaultValue,
    parent_column_id: column.parentColumnId,
    depends_on: column.dependsOn
  };
};

// Validasiya qaydaları tipi
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  patternError?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  warningThreshold?: {
    min?: number;
    max?: number;
  };
  format?: string;
  regex?: string;
  customValidator?: (value: any) => { valid: boolean; message?: string };
}
