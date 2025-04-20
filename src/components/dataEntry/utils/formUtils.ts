
import { ColumnValidationError } from '@/types/dataEntry';
import { Column } from '@/types/column';

export const validateEntry = (value: string, column: Column): ColumnValidationError[] => {
  const errors: ColumnValidationError[] = [];
  const validation = column.validation || {};
  
  // Boş dəyər yoxlanışı
  if (column.is_required && (!value || value.trim() === '')) {
    errors.push({
      field: column.name,
      message: 'Bu sahə məcburidir',
      type: 'required',
      severity: 'error',
      columnId: column.id
    });
    return errors; // Məcburi sahə boşdursa, digər validasiyalara ehtiyac yoxdur
  }
  
  // Əgər məcburi deyilsə və boşdursa, validasiya etmirik
  if (!value || value.trim() === '') {
    return errors;
  }
  
  // Rəqəm tipli sütunlar üçün validasiya
  if (column.type === 'number') {
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      errors.push({
        field: column.name,
        message: 'Daxil edilən dəyər rəqəm olmalıdır',
        type: 'numeric',
        severity: 'error',
        columnId: column.id
      });
    } else {
      if (validation.minValue !== undefined && numValue < validation.minValue) {
        errors.push({
          field: column.name,
          message: `Dəyər ${validation.minValue}-dən böyük olmalıdır`,
          type: 'minValue',
          severity: 'error',
          columnId: column.id
        });
      }
      
      if (validation.maxValue !== undefined && numValue > validation.maxValue) {
        errors.push({
          field: column.name,
          message: `Dəyər ${validation.maxValue}-dən kiçik olmalıdır`,
          type: 'maxValue',
          severity: 'error',
          columnId: column.id
        });
      }
    }
  }
  
  // Mətn tipli sütunlar üçün validasiya
  if (column.type === 'text' || column.type === 'textarea') {
    if (validation.minLength !== undefined && value.length < validation.minLength) {
      errors.push({
        field: column.name,
        message: `Mətn minimum ${validation.minLength} simvol olmalıdır`,
        type: 'minLength',
        severity: 'error',
        columnId: column.id
      });
    }
    
    if (validation.maxLength !== undefined && value.length > validation.maxLength) {
      errors.push({
        field: column.name,
        message: `Mətn maksimum ${validation.maxLength} simvol olmalıdır`,
        type: 'maxLength',
        severity: 'error',
        columnId: column.id
      });
    }
    
    if (validation.pattern) {
      try {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push({
            field: column.name,
            message: validation.customMessage || 'Daxil edilən dəyər tələb olunan formatda deyil',
            type: 'pattern',
            severity: 'error',
            columnId: column.id
          });
        }
      } catch (error) {
        console.error('Invalid regex pattern:', validation.pattern);
      }
    }
  }
  
  // Email validasiyası
  if (column.type === 'email' || (validation.email && column.type === 'text')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errors.push({
        field: column.name,
        message: 'Düzgün e-poçt ünvanı daxil edin',
        type: 'email',
        severity: 'error',
        columnId: column.id
      });
    }
  }
  
  return errors;
};

export const validateAllEntries = (entries: { column_id: string; value: string }[], columns: Column[]): Record<string, ColumnValidationError[]> => {
  const validationResults: Record<string, ColumnValidationError[]> = {};
  
  entries.forEach(entry => {
    const column = columns.find(c => c.id === entry.column_id);
    if (column) {
      const errors = validateEntry(entry.value, column);
      if (errors.length > 0) {
        validationResults[entry.column_id] = errors;
      }
    }
  });
  
  return validationResults;
};

export const hasValidationErrors = (validationResults: Record<string, ColumnValidationError[]>): boolean => {
  return Object.keys(validationResults).length > 0;
};
