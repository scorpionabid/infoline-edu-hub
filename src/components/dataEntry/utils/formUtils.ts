
import { Column, ColumnValidationError } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';

export const validateRequiredFields = (
  columns: Column[],
  entries: DataEntry[]
): ColumnValidationError[] => {
  const errors: ColumnValidationError[] = [];
  
  columns.forEach(column => {
    if (column.is_required) {
      const entry = entries.find(e => e.column_id === column.id);
      if (!entry || !entry.value || entry.value.trim() === '') {
        errors.push({
          columnId: column.id,
          columnName: column.name,
          type: 'required',
          message: 'Bu sahə məcburidir'
        });
      }
    }
  });

  return errors;
};

export const validateColumnType = (
  column: Column,
  value: string
): ColumnValidationError | null => {
  if (!value) return null;

  switch (column.type) {
    case 'email':
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return {
          columnId: column.id,
          columnName: column.name,
          type: 'format',
          message: 'Düzgün email formatı daxil edin'
        };
      }
      break;
    
    case 'number':
      if (isNaN(Number(value))) {
        return {
          columnId: column.id,
          columnName: column.name,
          type: 'format',
          message: 'Rəqəm daxil edin'
        };
      }
      break;

    case 'url':
      try {
        new URL(value);
      } catch (e) {
        return {
          columnId: column.id,
          columnName: column.name,
          type: 'format',
          message: 'Düzgün URL formatı daxil edin'
        };
      }
      break;

    case 'phone':
      if (!/^\+?[0-9\s\-()]{5,20}$/.test(value)) {
        return {
          columnId: column.id,
          columnName: column.name,
          type: 'format',
          message: 'Düzgün telefon nömrəsi formatı daxil edin'
        };
      }
      break;
  }

  // Əlavə validasiya qaydalarını yoxla
  if (column.validation && Array.isArray(column.validation)) {
    for (const rule of column.validation) {
      // Minimum və maximum dəyərləri yoxla
      if (column.type === 'number') {
        const numValue = Number(value);
        
        if (rule.type === 'min' && numValue < rule.value) {
          return {
            columnId: column.id,
            columnName: column.name,
            type: 'validation',
            message: rule.message || `Minimum dəyər ${rule.value} olmalıdır`
          };
        }
        
        if (rule.type === 'max' && numValue > rule.value) {
          return {
            columnId: column.id,
            columnName: column.name,
            type: 'validation',
            message: rule.message || `Maksimum dəyər ${rule.value} olmalıdır`
          };
        }
      }
      
      // Mətn uzunluğunu yoxla
      if (column.type === 'text' || column.type === 'textarea' || column.type === 'email') {
        if (rule.type === 'minLength' && value.length < rule.value) {
          return {
            columnId: column.id,
            columnName: column.name,
            type: 'validation',
            message: rule.message || `Minimum ${rule.value} simvol olmalıdır`
          };
        }
        
        if (rule.type === 'maxLength' && value.length > rule.value) {
          return {
            columnId: column.id,
            columnName: column.name,
            type: 'validation',
            message: rule.message || `Maksimum ${rule.value} simvol olmalıdır`
          };
        }
      }
      
      // Pattern/regex yoxlaması
      if (rule.type === 'pattern' && rule.value && !new RegExp(rule.value).test(value)) {
        return {
          columnId: column.id,
          columnName: column.name,
          type: 'validation',
          message: rule.message || 'Düzgün format daxil edin'
        };
      }
    }
  }

  return null;
};

// Bütün daxil edilmiş məlumatları validasiya et
export const validateAllEntries = (
  columns: Column[],
  entries: DataEntry[]
): ColumnValidationError[] => {
  const requiredErrors = validateRequiredFields(columns, entries);
  const typeErrors: ColumnValidationError[] = [];
  
  // Mövcud olan daxil edilmiş məlumatlar üçün tip validasiyası
  entries.forEach(entry => {
    const column = columns.find(c => c.id === entry.column_id);
    if (column && entry.value) {
      const error = validateColumnType(column, entry.value);
      if (error) typeErrors.push(error);
    }
  });
  
  return [...requiredErrors, ...typeErrors];
};

// Tək bir giriş məlumatı üçün validasiya
export const validateSingleEntry = (
  column: Column,
  value: string
): ColumnValidationError | null => {
  // Məcburi sahə yoxlaması
  if (column.is_required && (!value || value.trim() === '')) {
    return {
      columnId: column.id,
      columnName: column.name,
      type: 'required',
      message: 'Bu sahə məcburidir'
    };
  }
  
  // Tip yoxlaması
  return validateColumnType(column, value);
};

