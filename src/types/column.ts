
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
  format?: string;
  min?: number;
  max?: number;
  regex?: string;
  minDate?: string;
  maxDate?: string;
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
  dependsOn?: string;
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
}

export type CategoryStatus = 'active' | 'inactive' | 'archived';
export type CategoryAssignment = 'all' | 'sectors' | 'specific';

// Supabase-dən gələn sütun obyektini Column tipinə çevirmək üçün
export const adaptColumnToSupabase = (column: Column) => {
  return {
    id: column.id,
    name: column.name,
    category_id: column.categoryId,
    type: column.type,
    is_required: column.isRequired,
    options: Array.isArray(column.options) ? JSON.stringify(column.options) : null,
    order_index: column.orderIndex || column.order || 0,
    placeholder: column.placeholder || null,
    help_text: column.helpText || null,
    default_value: column.defaultValue || null,
    validation: column.validation ? JSON.stringify(column.validation) : null,
    status: column.status || 'active',
    parent_column_id: column.parentColumnId || null,
    depends_on: column.dependsOn || null
  };
};
