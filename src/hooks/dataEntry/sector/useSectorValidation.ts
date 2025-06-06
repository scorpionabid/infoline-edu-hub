
import { useCallback } from 'react';
import { Column } from '@/types/column';

export interface UseSectorValidationResult {
  validateField: (column: Column, value: any) => string | null;
  validateForm: (formData: Record<string, any>, columns: Column[]) => Record<string, string>;
  validateBulkData: (data: Record<string, any>[], columns: Column[]) => Record<string, string>[];
}

export const useSectorValidation = (): UseSectorValidationResult => {
  const validateField = useCallback((column: Column, value: any): string | null => {
    if (column.is_required && (!value || value === '')) {
      return `${column.name} is required`;
    }

    if (column.validation_rules?.min_value && Number(value) < column.validation_rules.min_value) {
      return `Minimum value is ${column.validation_rules.min_value}`;
    }

    if (column.validation_rules?.max_value && Number(value) > column.validation_rules.max_value) {
      return `Maximum value is ${column.validation_rules.max_value}`;
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

  const validateBulkData = useCallback((data: Record<string, any>[], columns: Column[]): Record<string, string>[] => {
    return data.map(row => validateForm(row, columns));
  }, [validateForm]);

  return {
    validateField,
    validateForm,
    validateBulkData
  };
};

export default useSectorValidation;
