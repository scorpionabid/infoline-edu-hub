
import { Column, ColumnType, ColumnValidation } from '@/types/column';

export const validateColumnValue = (value: any, column: Column): { isValid: boolean; error?: string } => {
  if (column.is_required && (value === null || value === undefined || value === '')) {
    return { isValid: false, error: 'Bu sahə məcburidir' };
  }

  const validation = column.validation as ColumnValidation;

  switch (column.type) {
    case 'number':
      if (typeof value !== 'number' && value !== '') {
        return { isValid: false, error: 'Rəqəm daxil edilməlidir' };
      }
      if (validation?.minValue !== undefined && value < validation.minValue) {
        return { isValid: false, error: `Minimum dəyər ${validation.minValue} olmalıdır` };
      }
      if (validation?.maxValue !== undefined && value > validation.maxValue) {
        return { isValid: false, error: `Maximum dəyər ${validation.maxValue} olmalıdır` };
      }
      break;

    case 'text':
    case 'textarea':
      if (typeof value !== 'string') {
        return { isValid: false, error: 'Mətn daxil edilməlidir' };
      }
      if (validation?.minLength !== undefined && value.length < validation.minLength) {
        return { isValid: false, error: `Minimum ${validation.minLength} simvol olmalıdır` };
      }
      if (validation?.maxLength !== undefined && value.length > validation.maxLength) {
        return { isValid: false, error: `Maximum ${validation.maxLength} simvol olmalıdır` };
      }
      break;

    case 'select':
      if (!column.options?.some(opt => opt.value === value)) {
        return { isValid: false, error: 'Düzgün seçim edilməlidir' };
      }
      break;
  }

  return { isValid: true };
};

export const getDefaultValueForType = (type: ColumnType) => {
  switch (type) {
    case 'number':
      return 0;
    case 'checkbox':
      return false;
    case 'select':
      return '';
    case 'date':
      return new Date().toISOString();
    default:
      return '';
  }
};

export const formatValueForDisplay = (value: any, type: ColumnType): string => {
  if (value === null || value === undefined) {
    return '';
  }

  switch (type) {
    case 'date':
      return value instanceof Date 
        ? value.toLocaleDateString()
        : new Date(value).toLocaleDateString();
    case 'checkbox':
      return value ? 'Bəli' : 'Xeyr';
    case 'number':
      return value.toString();
    default:
      return value;
  }
};
