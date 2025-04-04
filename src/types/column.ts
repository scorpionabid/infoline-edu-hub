
export type ColumnType = 
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'image'
  | 'email'
  | 'phone'
  | 'textarea';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
  patternMessage?: string;
  format?: string;
  min?: number;
  max?: number;
  regex?: string;
  minDate?: string;
  maxDate?: string;
  warningThreshold?: number | { min?: number; max?: number };
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  categoryId: string;
  isRequired: boolean;
  options: string[] | ColumnOption[];
  orderIndex: number;
  order?: number;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  validation?: ColumnValidation;
  status?: string;
  parentColumnId?: string;
  parent_column_id?: string; // Uyğunluq üçün əlavə edildi
  dependsOn?: string;
  depends_on?: string; // Uyğunluq üçün əlavə edildi
}

export interface CategoryWithColumns {
  category: {
    id: string;
    name: string;
    description?: string;
    status: CategoryStatus;
    assignment: CategoryAssignment;
    priority: number;
    archived: boolean;
    column_count: number;
    deadline?: string;
  };
  columns: Column[];
  deadline?: string;
  id?: string; // CategoryWithColumns obyektinə birbaşa müraciət üçün
  name?: string; // CategoryWithColumns obyektinə birbaşa müraciət üçün
}

import { CategoryStatus, CategoryAssignment } from './category';

// Supabase-dən gələn sütun obyektini Column tipinə çevirmək üçün
export const adaptColumnToSupabase = (column: Column) => {
  return {
    id: column.id,
    name: column.name,
    category_id: column.categoryId,
    type: column.type,
    is_required: column.isRequired,
    options: Array.isArray(column.options) ? JSON.stringify(column.options) : column.options,
    order_index: column.orderIndex || column.order || 0,
    placeholder: column.placeholder || null,
    help_text: column.helpText || null,
    default_value: column.defaultValue || null,
    validation: column.validation ? JSON.stringify(column.validation) : null,
    status: column.status || 'active',
    parent_column_id: column.parentColumnId || column.parent_column_id || null,
    depends_on: column.dependsOn || column.depends_on || null
  };
};

// Supabase-dən gələn sütun obyektini bizim istifadə etdiyimiz Column tipinə çevirmək üçün adapter
export const adaptSupabaseColumn = (column: any): Column => {
  let options: string[] | ColumnOption[] = [];
  if (column.options) {
    try {
      options = typeof column.options === 'string' 
        ? JSON.parse(column.options) 
        : column.options;
    } catch (e) {
      console.error('Sütun seçimlərini parse edərkən xəta baş verdi:', e);
      // Əgər parse edilə bilmirsə, boş array istifadə et
      options = [];
    }
  }

  let validation: ColumnValidation | undefined;
  if (column.validation) {
    try {
      validation = typeof column.validation === 'string'
        ? JSON.parse(column.validation)
        : column.validation;
    } catch (e) {
      console.error('Sütun validasiyasını parse edərkən xəta baş verdi:', e);
      // Əgər parse edilə bilmirsə, boş validasiya istifadə et
      validation = {};
    }
  }

  return {
    id: column.id,
    name: column.name,
    type: column.type as ColumnType,
    categoryId: column.category_id || column.categoryId,
    isRequired: column.is_required || column.isRequired || false,
    options: options || [],
    orderIndex: column.order_index || column.orderIndex || 0,
    order: column.order || column.order_index || column.orderIndex || 0,
    placeholder: column.placeholder || '',
    helpText: column.help_text || column.helpText || '',
    defaultValue: column.default_value || column.defaultValue || '',
    validation: validation,
    status: column.status || 'active',
    parentColumnId: column.parent_column_id || column.parentColumnId,
    parent_column_id: column.parent_column_id || column.parentColumnId,
    dependsOn: column.depends_on || column.dependsOn,
    depends_on: column.depends_on || column.dependsOn
  };
};
