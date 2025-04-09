
import { Json } from '@/integrations/supabase/types';

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'boolean' | 'radio' | 'file' | 'image' | 'email' | 'phone' | 'textarea';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  patternError?: string;
  minDate?: string;
  maxDate?: string;
  format?: string;
  regex?: string;
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
  validation?: ValidationRules | Json;
  default_value?: string;
  placeholder?: string;
  help_text?: string;
  options?: ColumnOption[] | string[] | Json;
  created_at: string;
  updated_at: string;
  dependsOn?: DependsOnCondition;
  parentColumnId?: string;
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

// Supabase-dən gələn column məlumatlarını bizim Column tipinə adaptasiya etmək
export const adaptSupabaseColumn = (data: any): Column => {
  return {
    id: data.id,
    category_id: data.category_id,
    name: data.name,
    type: data.type,
    is_required: data.is_required || true,
    order_index: data.order_index || 0,
    status: data.status || 'active',
    validation: data.validation,
    default_value: data.default_value,
    placeholder: data.placeholder,
    help_text: data.help_text,
    options: data.options,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Column məlumatlarını Supabase formatına çevirmək
export const adaptColumnToSupabase = (column: Partial<Column>): any => {
  return {
    id: column.id,
    category_id: column.category_id,
    name: column.name,
    type: column.type,
    is_required: column.is_required,
    order_index: column.order_index,
    status: column.status,
    validation: column.validation,
    default_value: column.default_value,
    placeholder: column.placeholder,
    help_text: column.help_text,
    options: column.options,
    created_at: column.created_at,
    updated_at: column.updated_at
  };
};
