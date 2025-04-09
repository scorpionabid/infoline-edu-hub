
import { Json } from '@/integrations/supabase/types';

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'email' | 'phone' | 'boolean' | 'textarea';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status: 'active' | 'inactive' | 'draft';
  validation?: ValidationRules;
  default_value?: string;
  options?: ColumnOption[] | string[];
  created_at: string;
  updated_at: string;
  // Əlavə xüsusiyyətlər
  order?: number;
  parentColumnId?: string;
  dependsOn?: string;
  categoryId?: string; // Uyğunluq üçün
  isRequired?: boolean; // Uyğunluq üçün
  defaultValue?: string; // Uyğunluq üçün
  helpText?: string; // Uyğunluq üçün
  validationRules?: ValidationRules; // Uyğunluq üçün
}

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
  warningThreshold?: {
    min?: number;
    max?: number;
  };
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: 'active' | 'inactive' | 'draft' | 'pending' | 'approved' | 'rejected';
  priority: number;
  columns: Column[];
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
  // Uyğunluq xüsusiyyətləri
  createdAt?: string;
  updatedAt?: string;
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
    updated_at: data.updated_at,
    // Uyğunluq üçün əlavə xüsusiyyətlər
    categoryId: data.category_id,
    isRequired: data.is_required !== false,
    defaultValue: data.default_value,
    helpText: data.help_text,
    order: data.order_index || 0,
    validationRules: data.validation
  };
};

export const adaptColumnToSupabase = (column: Partial<Column>): any => {
  return {
    id: column.id,
    category_id: column.category_id || column.categoryId,
    name: column.name,
    type: column.type,
    is_required: column.is_required !== undefined ? column.is_required : column.isRequired,
    placeholder: column.placeholder,
    help_text: column.help_text || column.helpText,
    order_index: column.order_index || column.order || 0,
    status: column.status,
    validation: column.validation || column.validationRules,
    default_value: column.default_value || column.defaultValue,
    options: column.options,
    created_at: column.created_at,
    updated_at: column.updated_at
  };
};
