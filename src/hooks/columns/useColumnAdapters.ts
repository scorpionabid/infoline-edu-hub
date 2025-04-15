
import { Column } from '@/types/column';

export const useColumnAdapters = () => {
  const adaptColumnToForm = (column: Column) => {
    return {
      ...column,
      parent_column_id: column.parent_column_id || undefined
    };
  };

  const adaptFormToColumn = (formData: Partial<Column>): Partial<Column> => {
    return {
      ...formData,
      parent_column_id: formData.parent_column_id || null
    };
  };

  // Supabase-dən gələn sütunu tətbiq sütununa çevirmək
  const adaptSupabaseToColumn = (dbColumn: any): Column => {
    return {
      id: dbColumn.id,
      category_id: dbColumn.category_id,
      name: dbColumn.name,
      type: dbColumn.type,
      is_required: dbColumn.is_required,
      order_index: dbColumn.order_index || 0,
      status: dbColumn.status || 'active',
      validation: dbColumn.validation || {},
      default_value: dbColumn.default_value,
      placeholder: dbColumn.placeholder,
      help_text: dbColumn.help_text,
      options: Array.isArray(dbColumn.options) ? dbColumn.options : [],
      created_at: dbColumn.created_at,
      updated_at: dbColumn.updated_at,
      parent_column_id: dbColumn.parent_column_id
    };
  };

  // Tətbiq sütununu Supabase formatına çevirmək
  const adaptColumnToSupabase = (column: Partial<Column>) => {
    return {
      name: column.name,
      category_id: column.category_id,
      type: column.type,
      is_required: column.is_required,
      order_index: column.order_index,
      status: column.status,
      validation: column.validation,
      default_value: column.default_value,
      placeholder: column.placeholder,
      help_text: column.help_text,
      options: column.options,
      parent_column_id: column.parent_column_id
    };
  };

  return {
    adaptColumnToForm,
    adaptFormToColumn,
    adaptSupabaseToColumn,
    adaptColumnToSupabase
  };
};

// Modul seviyesinde export edilən adapter funksiyaları
export const adaptSupabaseToColumn = (dbColumn: any): Column => {
  return {
    id: dbColumn.id,
    category_id: dbColumn.category_id,
    name: dbColumn.name,
    type: dbColumn.type,
    is_required: dbColumn.is_required,
    order_index: dbColumn.order_index || 0,
    status: dbColumn.status || 'active',
    validation: dbColumn.validation || {},
    default_value: dbColumn.default_value,
    placeholder: dbColumn.placeholder,
    help_text: dbColumn.help_text,
    options: Array.isArray(dbColumn.options) ? dbColumn.options : [],
    created_at: dbColumn.created_at,
    updated_at: dbColumn.updated_at,
    parent_column_id: dbColumn.parent_column_id
  };
};

export const adaptColumnToSupabase = (column: Partial<Column>) => {
  return {
    name: column.name,
    category_id: column.category_id,
    type: column.type,
    is_required: column.is_required,
    order_index: column.order_index,
    status: column.status,
    validation: column.validation,
    default_value: column.default_value,
    placeholder: column.placeholder,
    help_text: column.help_text,
    options: column.options,
    parent_column_id: column.parent_column_id
  };
};
