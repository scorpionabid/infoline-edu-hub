
import { Json } from '@/integrations/supabase/types';

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'email' | 'phone' | 'boolean' | 'textarea';

export interface ColumnOption {
  label: string;
  value: string;
}

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

export interface Column {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: ColumnOption[] | Json;
  order: number;
  status: 'active' | 'inactive';
  defaultValue?: string;
  validationRules?: ValidationRules;
  validation?: Json; // From Supabase
  parentColumnId?: string;
  dependencies?: string[];
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description: string;
  deadline?: string | Date;
  status: 'active' | 'inactive' | string; // Allow for "pending", "approved", "rejected" temporary status values
  priority: number;
  assignment: 'all' | 'sectors';
  createdAt: string | Date;
  updatedAt?: string | Date;
  columns: Column[];
}

export function adaptColumnToSupabase(column: Column) {
  return {
    id: column.id,
    category_id: column.categoryId,
    name: column.name,
    type: column.type,
    is_required: column.isRequired,
    placeholder: column.placeholder || null,
    help_text: column.helpText || null,
    options: ["select", "checkbox", "radio"].includes(column.type) ? column.options : null,
    order_index: column.order,
    status: column.status,
    default_value: column.defaultValue || null,
    validation: column.validationRules || column.validation || null
  };
}
