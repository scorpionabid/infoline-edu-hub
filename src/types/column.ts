
import { Json } from '@/integrations/supabase/types';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status: 'active' | 'inactive' | 'draft';
  validation?: any;
  default_value?: string;
  options?: any;
  created_at: string;
  updated_at: string;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'email' | 'phone' | 'boolean' | 'textarea';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  minValue?: number;
  maxValue?: number;
  format?: string;
  regex?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
  minDate?: string;
  maxDate?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  columns: Column[];
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
}

// Supabase adaptation functions
export const adaptSupabaseColumn = (data: any): Column => {
  return {
    id: data.id,
    category_id: data.category_id,
    name: data.name,
    type: data.type,
    is_required: data.is_required !== false, // Default to true if not specified
    placeholder: data.placeholder,
    help_text: data.help_text,
    order_index: data.order_index || 0,
    status: data.status || 'active',
    validation: data.validation,
    default_value: data.default_value,
    options: data.options,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const adaptColumnToSupabase = (column: Partial<Column>): any => {
  return {
    id: column.id,
    category_id: column.category_id,
    name: column.name,
    type: column.type,
    is_required: column.is_required,
    placeholder: column.placeholder,
    help_text: column.help_text,
    order_index: column.order_index,
    status: column.status,
    validation: column.validation,
    default_value: column.default_value,
    options: column.options,
    created_at: column.created_at,
    updated_at: column.updated_at
  };
};
