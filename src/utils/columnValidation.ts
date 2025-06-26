
import { Column, ColumnType, ColumnValidation } from '@/types/column';

export const validateColumnValue = (value: any, column: Column): { isValid: boolean; error?: string } => {
  // Required field check
  if (column.is_required && (value === null || value === undefined || value === '')) {
    return { isValid: false, error: 'Bu sahə məcburidir' };
  }

  const validation = column.validation as ColumnValidation;

  switch (column.type) {
    case 'number': {
      if (value === '') return { isValid: true };
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { isValid: false, error: 'Rəqəm daxil edilməlidir' };
      }
      if (validation?.minValue !== undefined && numValue < validation.minValue) {
        return { isValid: false, error: `Minimum dəyər ${validation.minValue} olmalıdır` };
      }
      if (validation?.maxValue !== undefined && numValue > validation.maxValue) {
        return { isValid: false, error: `Maximum dəyər ${validation.maxValue} olmalıdır` };
      }
      break;
    }

    case 'text':
    case 'textarea': {
      if (typeof value !== 'string' && value !== '') {
        return { isValid: false, error: 'Mətn daxil edilməlidir' };
      }
      if (validation?.minLength !== undefined && value.length < validation.minLength) {
        return { isValid: false, error: `Minimum ${validation.minLength} simvol olmalıdır` };
      }
      if (validation?.maxLength !== undefined && value.length > validation.maxLength) {
        return { isValid: false, error: `Maximum ${validation.maxLength} simvol olmalıdır` };
      }
      if (validation?.pattern) {
        try {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            return { 
              isValid: false, 
              error: validation.customMessage || 'Düzgün format daxil edilməlidir' 
            };
          }
        } catch (e) {
          console.error('Invalid regex pattern:', e);
        }
      }
      break;
    }

    case 'select': {
      if (value && !column.options?.some(opt => opt.value === value)) {
        return { isValid: false, error: 'Düzgün seçim edilməlidir' };
      }
      break;
    }

    case 'date': {
      if (value && !isValidDate(value)) {
        return { isValid: false, error: 'Düzgün tarix formatı daxil edilməlidir' };
      }
      if (validation?.minDate && new Date(value) < new Date(validation.minDate)) {
        return { isValid: false, error: `Minimum tarix ${formatDate(validation.minDate)} olmalıdır` };
      }
      if (validation?.maxDate && new Date(value) > new Date(validation.maxDate)) {
        return { isValid: false, error: `Maximum tarix ${formatDate(validation.maxDate)} olmalıdır` };
      }
      break;
    }

    case 'checkbox': {
      if (typeof value !== 'boolean' && value !== '') {
        return { isValid: false, error: 'Düzgün seçim edilməlidir' };
      }
      break;
    }
  }

  return { isValid: true };
};

export const getDefaultValueForType = (type: ColumnType) => {
  switch (type) {
    case 'number': {
      return null;
    }
    case 'checkbox': {
      return false;
    }
    case 'select': {
      return '';
    }
    case 'date': {
      return null;
    }
    default: {
      return '';
    }
  }
};

export const formatValueForDisplay = (value: any, type: ColumnType): string => {
  if (value === null || value === undefined) {
    return '';
  }

  switch (type) {
    case 'date': {
      return formatDate(value);
    }
    case 'checkbox': {
      return value ? 'Bəli' : 'Xeyr';
    }
    case 'number': {
      return value.toString();
    }
    default: {
      return value;
    }
  }
};

// Helper functions
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};
