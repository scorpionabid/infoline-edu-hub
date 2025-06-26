
import { useCallback } from 'react';
import { Column } from '@/types/column';

export interface UseSchoolValidationResult {
  validateField: (column: Column, value: any) => string | null;
  validateForm: (formData: Record<string, any>, columns: Column[]) => Record<string, string>;
}

export const useSchoolValidation = (): UseSchoolValidationResult => {
  const validateField = useCallback((column: Column, value: any): string | null => {
    if (column.is_required && (!value || value === '')) {
      return `${column.name} is required`;
    }

    if (column.validation?.min_value && Number(value) < column.validation.min_value) {
      return `Minimum value is ${column.validation.min_value}`;
    }

    if (column.validation?.max_value && Number(value) > column.validation.max_value) {
      return `Maximum value is ${column.validation.max_value}`;
    }

    return null;
  }, []);

  const validateForm = useCallback((formData: Record<string, any>, columns: Column[]): Record<string, string> => {
    const errors: Record<string, string> = {};

    columns.forEach(column => {
      const error = validateField(column, formData[column.id]);
      if (error) {
        errors[column.id] = error;
      }
    });

    return errors;
  }, [validateField]);

  return {
    validateField,
    // validateForm
  };
};

export default useSchoolValidation;
