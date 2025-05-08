
import { Column } from '@/types/column';
import { ColumnValidation } from '@/types/column';

// Convert DB column to frontend column
export const adaptDbColumnToFrontend = (dbColumn: any): Column => {
  return {
    id: dbColumn.id,
    name: dbColumn.name,
    label: dbColumn.label || dbColumn.name,
    description: dbColumn.description,
    type: dbColumn.type,
    category_id: dbColumn.category_id,
    options: dbColumn.options || [],
    is_required: dbColumn.is_required !== false,
    status: dbColumn.status || 'active',
    order: dbColumn.order_index || 0,
    created_at: dbColumn.created_at,
    updated_at: dbColumn.updated_at,
    validation: dbColumn.validation || {},
    section: dbColumn.section,
    parent_column_id: dbColumn.parent_column_id,
    help_text: dbColumn.help_text,
    placeholder: dbColumn.placeholder,
    default_value: dbColumn.default_value,
    order_index: dbColumn.order_index || 0,
    conditional_display: dbColumn.conditional_display
  };
};

// Convert frontend column to DB format
export const adaptColumnToDb = (column: Partial<Column>): any => {
  const {
    name,
    label,
    description,
    type,
    category_id,
    options,
    is_required,
    status,
    validation,
    section,
    help_text,
    placeholder,
    default_value,
    order_index
  } = column;

  const dbColumn: any = {
    name,
    type,
    category_id,
  };

  // Add optional fields only if they exist
  if (label !== undefined) dbColumn.label = label;
  if (description !== undefined) dbColumn.description = description;
  if (options !== undefined) dbColumn.options = options;
  if (is_required !== undefined) dbColumn.is_required = is_required;
  if (status !== undefined) dbColumn.status = status;
  if (validation !== undefined) dbColumn.validation = validation;
  if (section !== undefined) dbColumn.section = section;
  if (help_text !== undefined) dbColumn.help_text = help_text;
  if (placeholder !== undefined) dbColumn.placeholder = placeholder;
  if (default_value !== undefined) dbColumn.default_value = default_value;
  if (order_index !== undefined) dbColumn.order_index = order_index;
  if (column.parent_column_id !== undefined) {
    dbColumn.parent_column_id = column.parent_column_id;
  }
  if (column.conditional_display !== undefined) {
    dbColumn.conditional_display = column.conditional_display;
  }

  return dbColumn;
};

// Helper to create a new column template
export const createColumnTemplate = (categoryId: string): Column => {
  return {
    id: crypto.randomUUID(),
    name: '',
    type: 'text',
    category_id: categoryId,
    is_required: true,
    options: [],
    status: 'active',
    help_text: '',
    placeholder: '',
    order_index: 0
  };
};
