
import { Column } from "@/types/column"; 

/**
 * Tip yoxlama və konversiya funksiyaları
 */

/**
 * Sütun tipinin düzgün olub-olmadığını yoxlayır
 * @param type Yoxlanılacaq tip
 */
export function isValidColumnType(type: string): type is Column['type'] {
  return ['text', 'number', 'date', 'select', 'textarea', 'checkbox', 'radio'].includes(type);
}

/**
 * Supabase sütun tipini tətbiq Column tipinə çevirir
 * @param dbType Verilənlər bazası tip dəyəri
 */
export function mapDbColumnTypeToAppType(dbType: string): Column['type'] {
  switch (dbType) {
    case 'text':
    case 'string':
    case 'varchar':
      return 'text';
    case 'number':
    case 'integer':
    case 'float':
    case 'numeric':
    case 'decimal':
      return 'number';
    case 'date':
    case 'datetime':
    case 'timestamp':
      return 'date';
    case 'select':
    case 'dropdown':
    case 'enum':
      return 'select';
    case 'textarea':
    case 'longtext':
    case 'text_area':
      return 'textarea';
    case 'checkbox':
    case 'boolean':
      return 'checkbox';
    case 'radio':
    case 'radio_button':
      return 'radio';
    default:
      console.warn(`Naməlum sütun tipi: ${dbType}, default olaraq text qəbul edilir`);
      return 'text'; // Default olaraq text qəbul edirik
  }
}

/**
 * Verilənlər bazasından gələn sütunu tətbiq Sütun tipinə çevirir
 * @param dbColumn Verilənlər bazasından gələn sütun
 */
export function mapDbColumnToAppColumn(dbColumn: any): Column {
  if (!dbColumn) {
    throw new Error('Sütun məlumatı təqdim edilməyib');
  }
  
  // Əgər options bir string olaraq gəlirsə, JSON-a çevirir
  let options = dbColumn.options;
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options);
    } catch (e) {
      options = [];
      console.error('Sütun seçimlərini parse edərkən xəta:', e);
    }
  }
  
  // Əgər validation bir string olaraq gəlirsə, JSON-a çevirir
  let validation = dbColumn.validation;
  if (typeof validation === 'string') {
    try {
      validation = JSON.parse(validation);
    } catch (e) {
      validation = {};
      console.error('Sütun validasiyasını parse edərkən xəta:', e);
    }
  }
  
  return {
    id: dbColumn.id,
    name: dbColumn.name,
    type: mapDbColumnTypeToAppType(dbColumn.type || 'text'),
    category_id: dbColumn.category_id,
    is_required: dbColumn.is_required || false,
    order_index: dbColumn.order_index || 0,
    help_text: dbColumn.help_text,
    placeholder: dbColumn.placeholder,
    options: options || [],
    validation: validation || {},
    default_value: dbColumn.default_value,
    status: dbColumn.status || 'active',
    created_at: dbColumn.created_at || new Date().toISOString(),
    updated_at: dbColumn.updated_at || new Date().toISOString()
  };
}

/**
 * Dəyəri sütun tipinə görə formatla
 * @param value Formatlanacaq dəyər
 * @param columnType Sütun tipi
 */
export function formatValueByColumnType(value: any, columnType: Column['type']): any {
  if (value === null || value === undefined) {
    return '';
  }
  
  switch (columnType) {
    case 'number':
      return typeof value === 'number' ? value : Number(value) || 0;
    case 'checkbox':
      return Boolean(value);
    case 'date':
      if (value instanceof Date) {
        return value.toISOString();
      } else if (typeof value === 'string') {
        return value;
      }
      return new Date().toISOString();
    default:
      return String(value);
  }
}

/**
 * Dəyərin düzgün olub-olmadığını sütun tipinə görə yoxlayır
 * @param value Yoxlanılacaq dəyər
 * @param column Sütun obyekti
 */
export function validateColumnValue(value: any, column: Column): { isValid: boolean; errorMessage?: string } {
  // Əgər məcburi sahə boşdursa xəta
  if (column.is_required && (value === null || value === undefined || value === '')) {
    return { 
      isValid: false,
      errorMessage: 'Bu sahə məcburidir'
    };
  }
  
  // Əgər dəyər boşdursa və məcburi deyilsə, keçərlidir
  if (value === null || value === undefined || value === '') {
    return { isValid: true };
  }
  
  // Tip yoxlamaları
  switch (column.type) {
    case 'number':
      if (isNaN(Number(value))) {
        return { 
          isValid: false,
          errorMessage: 'Rəqəm daxil edin'
        };
      }
      
      // Min/max yoxlamaları
      const numValue = Number(value);
      if (column.validation?.minValue !== undefined && numValue < column.validation.minValue) {
        return { 
          isValid: false,
          errorMessage: `Minimum dəyər ${column.validation.minValue} olmalıdır`
        };
      }
      
      if (column.validation?.maxValue !== undefined && numValue > column.validation.maxValue) {
        return { 
          isValid: false,
          errorMessage: `Maksimum dəyər ${column.validation.maxValue} olmalıdır`
        };
      }
      break;
      
    case 'text':
    case 'textarea':
      const strValue = String(value);
      
      // Min/max uzunluq yoxlamaları
      if (column.validation?.minLength !== undefined && strValue.length < column.validation.minLength) {
        return { 
          isValid: false,
          errorMessage: `Minimum ${column.validation.minLength} simvol daxil edin`
        };
      }
      
      if (column.validation?.maxLength !== undefined && strValue.length > column.validation.maxLength) {
        return { 
          isValid: false,
          errorMessage: `Maksimum ${column.validation.maxLength} simvol daxil edilə bilər`
        };
      }
      
      // Regex yoxlaması
      if (column.validation?.pattern) {
        const regex = new RegExp(column.validation.pattern);
        if (!regex.test(strValue)) {
          return { 
            isValid: false,
            errorMessage: column.validation.patternError || 'Düzgün format daxil edin'
          };
        }
      }
      break;
      
    case 'date':
      // Tarix yoxlaması
      try {
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          throw new Error('Invalid date');
        }
        
        // Min/max tarix yoxlamaları
        if (column.validation?.minDate) {
          const minDate = new Date(column.validation.minDate);
          if (dateValue < minDate) {
            return { 
              isValid: false,
              errorMessage: `Tarix ${minDate.toLocaleDateString()} tarixindən sonra olmalıdır`
            };
          }
        }
        
        if (column.validation?.maxDate) {
          const maxDate = new Date(column.validation.maxDate);
          if (dateValue > maxDate) {
            return { 
              isValid: false,
              errorMessage: `Tarix ${maxDate.toLocaleDateString()} tarixindən əvvəl olmalıdır`
            };
          }
        }
      } catch (e) {
        return { 
          isValid: false,
          errorMessage: 'Düzgün tarix formatı daxil edin'
        };
      }
      break;
  }
  
  return { isValid: true };
}
