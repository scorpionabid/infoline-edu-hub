
import { Column, ColumnType } from '@/types/column';

export const columnAdapter = {
  adaptColumnToForm: (column: Column) => {
    return {
      id: column.id,
      category_id: column.category_id,
      name: column.name,
      type: column.type,
      is_required: column.is_required,
      placeholder: column.placeholder,
      help_text: column.help_text,
      order_index: column.order_index,
      status: column.status,
      validation: column.validation,
      default_value: column.default_value,
      options: column.options,
      parent_column_id: column.parent_column_id,
      created_at: column.created_at,
      updated_at: column.updated_at
    };
  },
  
  adaptFormToColumn: (formData: Partial<Column>): Partial<Column> => {
    return {
      id: formData.id,
      category_id: formData.category_id,
      name: formData.name,
      type: formData.type,
      is_required: formData.is_required,
      placeholder: formData.placeholder,
      help_text: formData.help_text,
      order_index: formData.order_index,
      status: formData.status,
      validation: formData.validation,
      default_value: formData.default_value,
      options: formData.options,
      parent_column_id: formData.parent_column_id
    };
  },
  
  adaptSupabaseToColumn: (dbColumn: any): Column => {
    return {
      id: dbColumn.id,
      category_id: dbColumn.category_id,
      name: dbColumn.name,
      type: dbColumn.type as ColumnType,
      is_required: dbColumn.is_required,
      placeholder: dbColumn.placeholder,
      help_text: dbColumn.help_text,
      order_index: dbColumn.order_index,
      status: dbColumn.status as 'active' | 'inactive' | 'draft',
      validation: dbColumn.validation ? 
        (typeof dbColumn.validation === 'string' ? 
          JSON.parse(dbColumn.validation) : dbColumn.validation) : 
        null,
      default_value: dbColumn.default_value,
      options: dbColumn.options ? 
        (typeof dbColumn.options === 'string' ? 
          JSON.parse(dbColumn.options) : dbColumn.options) : 
        null,
      parent_column_id: dbColumn.parent_column_id,
      created_at: dbColumn.created_at,
      updated_at: dbColumn.updated_at
    };
  }
};
