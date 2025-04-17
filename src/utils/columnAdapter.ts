
import { Column, ColumnType } from '@/types/column';

export const columnAdapter = {
  adaptColumnToForm: (column: Column) => {
    return {
      id: column.id,
      category_id: column.category_id,
      name: column.name,
      type: column.type,
      is_required: column.is_required ?? true, // Default olaraq məcburi
      placeholder: column.placeholder || '',
      help_text: column.help_text || '',
      order_index: column.order_index || 0,
      status: column.status || 'active',
      validation: column.validation || {},
      default_value: column.default_value || '',
      options: column.options || [],
      parent_column_id: column.parent_column_id || undefined,
      created_at: column.created_at,
      updated_at: column.updated_at
    };
  },
  
  adaptFormToColumn: (formData: Partial<Column>): Partial<Column> => {
    // JSON tipində olan xüsusiyyətləri seriallaşdırma
    return {
      id: formData.id,
      category_id: formData.category_id,
      name: formData.name,
      type: formData.type,
      is_required: formData.is_required,
      placeholder: formData.placeholder,
      help_text: formData.help_text,
      order_index: formData.order_index || 0,
      status: formData.status || 'active',
      validation: formData.validation,
      default_value: formData.default_value || '',
      options: formData.options,
      parent_column_id: formData.parent_column_id
    };
  },
  
  adaptSupabaseToColumn: (dbColumn: any): Column => {
    // DB-dən gələn məlumatları bizim Model-ə uyğunlaşdır
    const column: Column = {
      id: dbColumn.id,
      category_id: dbColumn.category_id,
      name: dbColumn.name,
      type: dbColumn.type as ColumnType,
      is_required: dbColumn.is_required ?? true,
      placeholder: dbColumn.placeholder || '',
      help_text: dbColumn.help_text || '',
      order_index: dbColumn.order_index || 0,
      status: dbColumn.status as 'active' | 'inactive' | 'draft',
      created_at: dbColumn.created_at,
      updated_at: dbColumn.updated_at
    };
    
    // Validasiya qaydalarını parse et
    if (dbColumn.validation) {
      try {
        column.validation = typeof dbColumn.validation === 'string' 
          ? JSON.parse(dbColumn.validation) 
          : dbColumn.validation;
      } catch (e) {
        console.error('Validasiya qaydaları parse xətası:', e);
        column.validation = {};
      }
    }
    
    // Seçimləri parse et
    if (dbColumn.options) {
      try {
        column.options = typeof dbColumn.options === 'string' 
          ? JSON.parse(dbColumn.options) 
          : dbColumn.options;
      } catch (e) {
        console.error('Seçimlər parse xətası:', e);
        column.options = [];
      }
    }
    
    // Parent sütun ID-sini əlavə et
    if (dbColumn.parent_column_id) {
      column.parent_column_id = dbColumn.parent_column_id;
    }
    
    // Default dəyər
    if (dbColumn.default_value !== null && dbColumn.default_value !== undefined) {
      column.default_value = dbColumn.default_value;
    }
    
    return column;
  }
};
