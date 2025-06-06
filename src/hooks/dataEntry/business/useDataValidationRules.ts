
import { useCallback } from 'react';
import { CategoryWithColumns } from '@/types/category';

export interface ValidationRulesOptions {
  category?: CategoryWithColumns | null;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  message: string;
  validator: (value: any) => boolean;
}

export interface ValidationRulesResult {
  validateField: (fieldId: string, value: any) => { isValid: boolean; message?: string };
  validateAll: (data: Record<string, any>) => { isValid: boolean; errors: Record<string, string> };
  getRulesForField: (fieldId: string) => ValidationRule[];
}

export const useDataValidationRules = ({
  category
}: ValidationRulesOptions): ValidationRulesResult => {

  const validateField = useCallback((fieldId: string, value: any) => {
    const column = category?.columns?.find(col => col.id === fieldId);
    if (!column) {
      return { isValid: true };
    }

    // Required validation
    if (column.is_required && (!value || value === '')) {
      return { isValid: false, message: `${column.name} is required` };
    }

    // Type-specific validation
    if (value && value !== '') {
      switch (column.type) {
        case 'email':
          if (!/\S+@\S+\.\S+/.test(value)) {
            return { isValid: false, message: 'Please enter a valid email address' };
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            return { isValid: false, message: 'Please enter a valid number' };
          }
          break;
        case 'phone':
          // Simple phone validation
          if (!/^[\d\s\-\+\(\)]+$/.test(value)) {
            return { isValid: false, message: 'Please enter a valid phone number' };
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            return { isValid: false, message: 'Please enter a valid URL' };
          }
          break;
      }
    }

    return { isValid: true };
  }, [category]);

  const validateAll = useCallback((data: Record<string, any>) => {
    const errors: Record<string, string> = {};
    
    if (category?.columns) {
      category.columns.forEach(column => {
        const validation = validateField(column.id, data[column.id]);
        if (!validation.isValid && validation.message) {
          errors[column.id] = validation.message;
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [category, validateField]);

  const getRulesForField = useCallback((fieldId: string): ValidationRule[] => {
    const column = category?.columns?.find(col => col.id === fieldId);
    const rules: ValidationRule[] = [];
    
    if (column) {
      if (column.is_required) {
        rules.push({
          field: fieldId,
          type: 'required',
          message: `${column.name} is required`,
          validator: (value) => value !== undefined && value !== '' && value !== null
        });
      }
      
      // Add type-specific rules
      switch (column.type) {
        case 'email':
          rules.push({
            field: fieldId,
            type: 'format',
            message: 'Must be a valid email address',
            validator: (value) => !value || /\S+@\S+\.\S+/.test(value)
          });
          break;
        case 'number':
          rules.push({
            field: fieldId,
            type: 'format',
            message: 'Must be a valid number',
            validator: (value) => !value || !isNaN(Number(value))
          });
          break;
      }
    }
    
    return rules;
  }, [category]);

  return {
    validateField,
    validateAll,
    getRulesForField
  };
};

export default useDataValidationRules;
