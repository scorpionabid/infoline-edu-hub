
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
  order?: number; // order_index ilə eyni
  parentColumnId?: string;
  dependsOn?: string;
  // Supabase uyğunluğu üçün
  category_id?: string;
  is_required?: boolean;
  default_value?: string;
  help_text?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
  parent_column_id?: string;
  depends_on?: string;
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
  minDate?: string;
  maxDate?: string;
}

export interface CategoryWithColumns {
  category: {
    id: string;
    name: string;
    description?: string;
    order?: number;
    priority: number;
    status?: string;
    assignment?: string;
    deadline?: string;
  };
  columns: Column[];
  id?: string;
  name?: string;
  priority?: number;
  description?: string;
  status?: string;
  assignment?: string;
  order?: number;
  deadline?: string;
}

// Adapters
export const adaptSupabaseColumn = (rawData: any): Column => {
  return {
    id: rawData.id,
    name: rawData.name,
    type: rawData.type as ColumnType,
    categoryId: rawData.category_id,
    category_id: rawData.category_id,
    isRequired: rawData.is_required ?? true,
    is_required: rawData.is_required ?? true,
    placeholder: rawData.placeholder,
    helpText: rawData.help_text,
    help_text: rawData.help_text,
    defaultValue: rawData.default_value,
    default_value: rawData.default_value,
    orderIndex: rawData.order_index || 0,
    order_index: rawData.order_index || 0,
    options: rawData.options || [],
    validation: rawData.validation || {},
    status: rawData.status || 'active',
    order: rawData.order_index || 0,
    created_at: rawData.created_at,
    updated_at: rawData.updated_at,
    parentColumnId: rawData.parent_column_id,
    parent_column_id: rawData.parent_column_id, 
    dependsOn: rawData.depends_on,
    depends_on: rawData.depends_on
  };
};

export const adaptColumnToSupabase = (column: Partial<Column>) => {
  // Column JSON formatını SupaBase formatına dəyişirik
  // Json tipinə uyğunlaşdırmaq üçün əməliyyatlar
  const safeOptions = Array.isArray(column.options) 
    ? column.options.map(o => typeof o === 'string' ? o : { value: o.value, label: o.label })
    : [];
    
  const safeValidation = column.validation || {};

  return {
    name: column.name,
    type: column.type,
    category_id: column.categoryId || column.category_id,
    is_required: column.isRequired ?? column.is_required ?? true,
    placeholder: column.placeholder,
    help_text: column.helpText || column.help_text,
    default_value: column.defaultValue || column.default_value,
    order_index: column.orderIndex || column.order_index || column.order || 0,
    options: safeOptions,
    validation: safeValidation,
    status: column.status || 'active',
    parent_column_id: column.parentColumnId || column.parent_column_id,
    depends_on: column.dependsOn || column.depends_on
  };
};
