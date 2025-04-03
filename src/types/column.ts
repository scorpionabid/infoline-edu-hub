
import { Json } from "./supabase";

export type ColumnType = 
  | "text" 
  | "number" 
  | "email" 
  | "phone" 
  | "date" 
  | "select" 
  | "multiselect"
  | "checkbox"
  | "radio"
  | "textarea"
  | "file"
  | "image"
  | "boolean";

export interface ColumnOption {
  value: string;
  label: string;
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
  orderIndex?: number;
  options?: string[] | ColumnOption[];
  validation?: ColumnValidation;
  status?: string;
  order: number; // əlavə edildi
  // Supabase uyğunluğu üçün
  category_id?: string;
  is_required?: boolean;
  default_value?: string;
  help_text?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
  parentColumnId?: string;
}

export interface ColumnValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  min?: number;
  max?: number;
  warningThreshold?: {
    min?: number;
    max?: number;
  };
  options?: string[] | ColumnOption[];
  required?: boolean;
}

export interface CategoryWithColumns {
  category: {
    id: string;
    name: string;
    description?: string;
    order: number;
    priority: number;
  };
  columns: Column[];
}

export const adaptSupabaseColumn = (rawData: any): Column => {
  return {
    id: rawData.id,
    name: rawData.name,
    type: rawData.type as ColumnType,
    categoryId: rawData.category_id,
    isRequired: rawData.is_required ?? true,
    placeholder: rawData.placeholder,
    helpText: rawData.help_text,
    defaultValue: rawData.default_value,
    orderIndex: rawData.order_index || 0,
    options: rawData.options || [],
    validation: rawData.validation || {},
    status: rawData.status || 'active',
    order: rawData.order || rawData.order_index || 0,
    created_at: rawData.created_at,
    updated_at: rawData.updated_at,
    parentColumnId: rawData.parent_column_id
  };
};

export const adaptColumnToSupabase = (column: Partial<Column>) => {
  return {
    name: column.name,
    type: column.type,
    category_id: column.categoryId || column.category_id,
    is_required: column.isRequired ?? column.is_required ?? true,
    placeholder: column.placeholder,
    help_text: column.helpText || column.help_text,
    default_value: column.defaultValue || column.default_value,
    order_index: column.orderIndex || column.order_index || 0,
    options: column.options || [],
    validation: column.validation || {},
    status: column.status || 'active',
    parent_column_id: column.parentColumnId
  };
};
