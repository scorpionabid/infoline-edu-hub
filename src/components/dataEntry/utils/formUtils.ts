
import { Column } from '@/types/column';
import { cn } from '@/lib/utils';
import { ValidationResult } from '@/types/dataEntry';

export const validateField = (value: any, column: Column): ValidationResult => {
  // Skip validation if field is not required and value is empty
  if (!column.is_required && (!value || value === '')) {
    return { valid: true };
  }

  // Required field validation
  if (column.is_required && (!value || value === '')) {
    return { 
      valid: false, 
      message: 'Bu sahə tələb olunur' 
    };
  }

  // Validation rules from column configuration
  if (column.validation) {
    // Numeric validation
    if (column.type === 'number' && typeof value === 'string' && value) {
      const numValue = Number(value);
      
      if (isNaN(numValue)) {
        return { valid: false, message: 'Rəqəm daxil edin' };
      }

      // Min/max validation
      const min = column.validation.min;
      const max = column.validation.max;
      
      if (min !== undefined && numValue < min) {
        return { 
          valid: false, 
          message: `Minimum dəyər ${min} olmalıdır` 
        };
      }
      
      if (max !== undefined && numValue > max) {
        return { 
          valid: false, 
          message: `Maksimum dəyər ${max} olmalıdır` 
        };
      }
    }
    
    // String length validation for text/textarea
    if (['text', 'textarea'].includes(column.type) && typeof value === 'string') {
      const minLength = column.validation.minLength;
      const maxLength = column.validation.maxLength;
      
      if (minLength !== undefined && value.length < minLength) {
        return { 
          valid: false, 
          message: `Minimum ${minLength} simvol olmalıdır` 
        };
      }
      
      if (maxLength !== undefined && value.length > maxLength) {
        return { 
          valid: false, 
          message: `Maksimum ${maxLength} simvol olmalıdır` 
        };
      }
    }
    
    // Regex pattern validation
    if (column.validation.pattern && typeof value === 'string') {
      try {
        const regex = new RegExp(column.validation.pattern);
        if (!regex.test(value)) {
          return { 
            valid: false, 
            message: column.validation.patternMessage || 'Format doğru deyil' 
          };
        }
      } catch (error) {
        console.error('Invalid regex pattern:', error);
      }
    }
  }

  // If all validations pass
  return { valid: true };
};

// Export cn utility for consistency
export { cn };
