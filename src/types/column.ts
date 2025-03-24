
import { Json } from '@/integrations/supabase/types';

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'textarea' | 'email' | 'phone' | 'boolean';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface Column {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType | string;
  isRequired?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: (string | ColumnOption)[] | Json;
  order?: number;
  status?: 'active' | 'inactive';
  parentColumnId?: string;
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    regex?: string;
    minDate?: string;
    maxDate?: string;
  };
  validationRules?: any; // Köhnə kodla uyğunluq üçün
  deadline?: string;     // Köhnə kodla uyğunluq üçün
  multiline?: boolean;   // Köhnə kodla uyğunluq üçün
  dependsOn?: {          // Asılılıq üçün əlavə edildi
    columnId: string;
    condition: {
      type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
      value: any;
    }
  };
}

export interface CategoryWithColumns {
  id?: string;
  name?: string;
  description?: string;
  deadline?: string;
  status?: string;
  columns: Column[];
  assignment?: 'all' | 'sectors';
  createdAt?: string;
  priority?: number;
  columnCount?: number;
}

export type CategoryColumn = {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType;
  isRequired?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: (string | ColumnOption)[] | Json;
  order: number;
  status: 'active' | 'inactive';
  parentColumnId?: string;
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    regex?: string;
    minDate?: string;
    maxDate?: string;
  };
  dependsOn?: {
    columnId: string;
    condition: {
      type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
      value: any;
    }
  };
};

// Supabase Column tipini Column tipinə çevirmək üçün adapter
export const adaptSupabaseColumn = (supabaseColumn: any): Column => {
  return {
    id: supabaseColumn.id,
    categoryId: supabaseColumn.category_id,
    name: supabaseColumn.name,
    type: supabaseColumn.type,
    isRequired: supabaseColumn.is_required,
    placeholder: supabaseColumn.placeholder,
    helpText: supabaseColumn.help_text,
    options: supabaseColumn.options,
    order: supabaseColumn.order_index,
    status: supabaseColumn.status,
    defaultValue: supabaseColumn.default_value,
    validation: supabaseColumn.validation,
  };
};

// Column tipini Supabase Column tipinə çevirmək üçün adapter
export const adaptColumnToSupabase = (column: Partial<Column>): any => {
  return {
    category_id: column.categoryId,
    name: column.name,
    type: column.type,
    is_required: column.isRequired,
    placeholder: column.placeholder,
    help_text: column.helpText,
    options: column.options,
    order_index: column.order,
    status: column.status,
    default_value: column.defaultValue,
    validation: column.validation,
  };
};
