
import { ColumnType, ValidationRules } from '@/types/column';

// Validation utility functions
export function validateColumnValue(value: any, type: string, isRequired: boolean, validation: ValidationRules | undefined): string | null {
  // Basic validation
  if (isRequired && isEmptyValue(value)) {
    return 'Bu sahə məcburidir';
  }
  
  // Value is not required and is empty, so it's valid
  if (!isRequired && isEmptyValue(value)) {
    return null;
  }

  // Type-specific validation
  switch (type) {
    case 'number':
      if (isNaN(Number(value))) {
        return 'Rəqəm daxil edin';
      }
      
      if (validation?.minValue !== undefined && Number(value) < validation.minValue) {
        return `Minimum dəyər ${validation.minValue} olmalıdır`;
      }
      
      if (validation?.maxValue !== undefined && Number(value) > validation.maxValue) {
        return `Maksimum dəyər ${validation.maxValue} olmalıdır`;
      }
      break;
      
    case 'text':
    case 'textarea':
      if (validation?.minLength !== undefined && String(value).length < validation.minLength) {
        return `Minimum uzunluq ${validation.minLength} olmalıdır`;
      }
      
      if (validation?.maxLength !== undefined && String(value).length > validation.maxLength) {
        return `Maksimum uzunluq ${validation.maxLength} olmalıdır`;
      }
      
      if (validation?.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(String(value))) {
          return validation.patternError || 'Format düzgün deyil';
        }
      }
      break;
      
    case 'date':
      // Date validation
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Düzgün tarix formatı deyil';
      }
      
      if (validation?.minDate && new Date(value) < new Date(validation.minDate)) {
        return `Tarix ${validation.minDate} tarixindən sonra olmalıdır`;
      }
      
      if (validation?.maxDate && new Date(value) > new Date(validation.maxDate)) {
        return `Tarix ${validation.maxDate} tarixindən əvvəl olmalıdır`;
      }
      break;
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return 'Düzgün e-poçt ünvanı daxil edin';
      }
      break;
      
    case 'phone':
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(String(value).replace(/\s/g, ''))) {
        return 'Düzgün telefon nömrəsi daxil edin';
      }
      break;
  }
  
  return null;
}

// Helper function to check if a value is empty
export function isEmptyValue(value: any): boolean {
  return value === undefined || value === null || value === '';
}

// Helper function for formatting values by their type
export function formatValueByType(value: any, type: ColumnType | string): any {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'number':
      return isNaN(Number(value)) ? '' : Number(value);
    case 'date':
      try {
        return value ? new Date(value).toISOString().split('T')[0] : '';
      } catch (e) {
        return '';
      }
    case 'boolean':
      return Boolean(value);
    default:
      return String(value);
  }
}
