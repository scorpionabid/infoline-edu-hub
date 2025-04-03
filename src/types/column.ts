
import { Json } from './supabase';
import { Category } from './category';

export type ColumnType = 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'radio' | 'file' | 'image' | 'textarea';

export type ColumnOption = {
  label: string;
  value: string;
};

export type Column = {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  isRequired: boolean;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  options?: string[] | ColumnOption[];  // Allow both string[] or object[] for options
  status: string;
  order: number;
  orderIndex: number;  // Add this missing property
  validation?: any;
  dependsOn?: string;  // Column that this field depends on
  parentColumnId?: string; // ID of the parent column if this is a dependent column
};

export type CategoryWithColumns = Category & {
  columns: Column[];
};

export type { Category } from './category';

// Function to adapt Supabase column data to our frontend model
export const adaptSupabaseColumn = (column: any): Column => {
  return {
    id: column.id,
    categoryId: column.category_id,
    name: column.name,
    type: column.type,
    isRequired: column.is_required ?? true,
    defaultValue: column.default_value || '',
    placeholder: column.placeholder || '',
    helpText: column.help_text || '',
    options: column.options || [],
    status: column.status || 'active',
    order: column.order || 0,
    orderIndex: column.order_index || 0,
    validation: column.validation || {},
    dependsOn: column.depends_on,
    parentColumnId: column.parent_column_id
  };
};

// Function to adapt frontend column model to Supabase format
export const adaptColumnToSupabase = (column: Partial<Column>): any => {
  return {
    id: column.id,
    category_id: column.categoryId,
    name: column.name,
    type: column.type,
    is_required: column.isRequired,
    default_value: column.defaultValue,
    placeholder: column.placeholder,
    help_text: column.helpText,
    options: column.options,
    status: column.status || 'active',
    order: column.order,
    order_index: column.orderIndex,
    validation: column.validation,
    depends_on: column.dependsOn,
    parent_column_id: column.parentColumnId
  };
};
