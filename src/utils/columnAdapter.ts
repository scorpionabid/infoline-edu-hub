
import { Column, ColumnType, ColumnOption, ColumnValidation } from '@/types/column';
import { Json } from '@/types/json';

export const columnAdapter = {
  adaptColumnToForm: (column: Column) => {
    // Form için column nesnesini adapte et
    return {
      id: column.id,
      category_id: column.category_id,
      name: column.name,
      type: column.type,
      is_required: column.is_required ?? true, // Default olarak zorunlu
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
    // Form verilerini Column tipine adapte et
    const column: Partial<Column> = {
      id: formData.id,
      category_id: formData.category_id,
      name: formData.name,
      type: formData.type,
      is_required: formData.is_required,
      placeholder: formData.placeholder,
      help_text: formData.help_text,
      order_index: formData.order_index || 0,
      status: formData.status || 'active',
      default_value: formData.default_value || '',
      parent_column_id: formData.parent_column_id
    };
    
    // Validation və options sahələrini əlavə et
    if (formData.validation) {
      column.validation = formData.validation as ColumnValidation;
    }
    
    if (formData.options) {
      column.options = formData.options;
    }
    
    return column;
  },
  
  adaptSupabaseToColumn: (dbColumn: any): Column => {
    if (!dbColumn) {
      console.error('Null or undefined dbColumn in adaptSupabaseToColumn');
      throw new Error('Cannot adapt null or undefined column data');
    }
    
    // DB'den gelen verileri model tipine dönüştür
    const column: Column = {
      id: dbColumn.id,
      category_id: dbColumn.category_id,
      name: dbColumn.name,
      type: dbColumn.type as ColumnType,
      is_required: dbColumn.is_required ?? true,
      placeholder: dbColumn.placeholder || '',
      help_text: dbColumn.help_text || '',
      order_index: dbColumn.order_index || 0,
      status: dbColumn.status || 'active',
      created_at: dbColumn.created_at,
      updated_at: dbColumn.updated_at
    };
    
    // Validasyon kurallarını parse et
    if (dbColumn.validation) {
      try {
        column.validation = typeof dbColumn.validation === 'string' 
          ? JSON.parse(dbColumn.validation) 
          : dbColumn.validation as ColumnValidation;
      } catch (e) {
        console.error('Validasyon kuralları parse hatası:', e);
        column.validation = {};
      }
    }
    
    // Seçenekleri parse et
    if (dbColumn.options) {
      try {
        let parsedOptions;
        
        if (typeof dbColumn.options === 'string') {
          parsedOptions = JSON.parse(dbColumn.options);
        } else {
          parsedOptions = dbColumn.options;
        }
        
        // Eğer options array değilse veya geçersizse, boş array ata
        if (!Array.isArray(parsedOptions)) {
          console.warn('Invalid options format, using empty array instead');
          column.options = [];
        } else {
          // Ensure all options have the correct format
          column.options = parsedOptions.map((opt: any) => {
            if (typeof opt === 'string') {
              return { label: opt, value: opt };
            } else if (typeof opt === 'object' && opt !== null) {
              return {
                label: opt.label || opt.toString(),
                value: opt.value || opt.label || opt.toString()
              };
            }
            return { label: String(opt), value: String(opt) };
          });
        }
      } catch (e) {
        console.error('Seçenekler parse hatası:', e);
        column.options = [];
      }
    } else {
      column.options = [];
    }
    
    // Parent sütun ID'sini ekle
    if (dbColumn.parent_column_id) {
      column.parent_column_id = dbColumn.parent_column_id;
    }
    
    // Default değer
    if (dbColumn.default_value !== null && dbColumn.default_value !== undefined) {
      column.default_value = dbColumn.default_value;
    }
    
    return column;
  }
};
