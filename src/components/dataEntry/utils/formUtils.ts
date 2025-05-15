
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Column } from '@/types/column';
import { ValidationResult } from '@/types/dataEntry';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const validateField = (value: any, column: Column): ValidationResult => {
  if (!column) {
    return { valid: true };
  }
  
  const errors: Record<string, string> = {};
  
  // Check required fields
  if (column.is_required && (value === undefined || value === null || value === '')) {
    return {
      valid: false,
      message: 'This field is required',
      errors: { required: 'This field is required' }
    };
  }
  
  // Skip further validation if empty and not required
  if (value === undefined || value === null || value === '') {
    return { valid: true };
  }
  
  const validation = column.validation || {};
  
  // Type specific validations
  switch (column.type) {
    case 'number':
      if (validation.min !== undefined && Number(value) < validation.min) {
        errors.min = `Value must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && Number(value) > validation.max) {
        errors.max = `Value must be at most ${validation.max}`;
      }
      break;
      
    case 'text':
    case 'textarea':
      if (validation.minLength !== undefined && String(value).length < validation.minLength) {
        errors.minLength = `Text must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength !== undefined && String(value).length > validation.maxLength) {
        errors.maxLength = `Text must be at most ${validation.maxLength} characters`;
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(String(value))) {
        errors.pattern = 'Input does not match the required format';
      }
      break;
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        errors.email = 'Please enter a valid email address';
      }
      break;
      
    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.date = 'Please enter a valid date';
      }
      if (validation.minDate && new Date(value) < new Date(validation.minDate)) {
        errors.minDate = `Date must be after ${new Date(validation.minDate).toLocaleDateString()}`;
      }
      if (validation.maxDate && new Date(value) > new Date(validation.maxDate)) {
        errors.maxDate = `Date must be before ${new Date(validation.maxDate).toLocaleDateString()}`;
      }
      break;
  }
  
  const isValid = Object.keys(errors).length === 0;
  
  return {
    valid: isValid,
    message: isValid ? undefined : Object.values(errors)[0],
    errors: isValid ? undefined : errors
  };
};

export default {
  cn,
  validateField
};
