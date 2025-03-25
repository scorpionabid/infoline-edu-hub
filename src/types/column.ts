
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
  // Retrokompatibilitet üçün
  min?: number; // minValue yerinə
  max?: number; // maxValue yerinə
  customValidator?: (value: any) => { valid: boolean; message?: string };
}

export interface Column {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType | string; // Supabase-dən string şəklində gəldiyində uyğunlaşsın
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: ColumnOption[] | Json;
  order: number;
  status: 'active' | 'inactive' | string;
  defaultValue?: string;
  validationRules?: ValidationRules | Json;
  validation?: Json; // From Supabase
  parentColumnId?: string;
  dependencies?: string[];
  dependsOn?: any; // Asılılıqlar üçün lazım
  multiline?: boolean; // Textarea üçün
  deadline?: string | Date; // Bəzi komponentlər deadline istifadə edir
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

/**
 * Supabase formatında gələn sütunu uyğunlaşdırmaq üçün funksiya 
 */
export function adaptSupabaseColumn(column: any): Column {
  return {
    id: column.id,
    categoryId: column.category_id,
    name: column.name,
    type: column.type as ColumnType,
    isRequired: column.is_required,
    placeholder: column.placeholder || '',
    helpText: column.help_text || '',
    options: column.options,
    order: column.order_index || 0,
    status: column.status === 'active' ? 'active' : 'inactive',
    defaultValue: column.default_value || '',
    validationRules: column.validation || {},
    validation: column.validation
  };
}

export function adaptColumnToSupabase(column: Partial<Column>) {
  return {
    id: column.id,
    category_id: column.categoryId,
    name: column.name,
    type: column.type,
    is_required: column.isRequired,
    placeholder: column.placeholder || null,
    help_text: column.helpText || null,
    options: ["select", "checkbox", "radio"].includes(column.type as string) ? column.options : null,
    order_index: column.order,
    status: column.status,
    default_value: column.defaultValue || null,
    validation: column.validationRules || column.validation || null
  };
}
