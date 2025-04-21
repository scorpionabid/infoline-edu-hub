
import { useState, useCallback } from 'react';
import { Column } from '@/types/column';
import { ColumnValidationError } from '@/types/dataEntry';
import { validateEntry, validateAllEntries } from '@/components/dataEntry/utils/formUtils';

export interface ValidationState {
  errors: Record<string, ColumnValidationError[]>;
  valid: boolean;
  validateField: (value: string, column: Column) => ColumnValidationError[];
  validateAll: (entries: { column_id: string; value: string }[], columns: Column[]) => boolean;
  setErrors: (errors: Record<string, ColumnValidationError[]>) => void;
  clearErrors: () => void;
  clearError: (columnId: string) => void;
}

export const useValidation = (): ValidationState => {
  const [errors, setErrors] = useState<Record<string, ColumnValidationError[]>>({});

  const validateField = useCallback((value: string, column: Column): ColumnValidationError[] => {
    const fieldErrors = validateEntry(value, column);
    
    if (fieldErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        [column.id]: fieldErrors
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[column.id];
        return newErrors;
      });
    }
    
    return fieldErrors;
  }, []);

  const validateAll = useCallback((entries: { column_id: string; value: string }[], columns: Column[]): boolean => {
    const validationResults = validateAllEntries(entries, columns);
    setErrors(validationResults);
    return Object.keys(validationResults).length === 0;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((columnId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[columnId];
      return newErrors;
    });
  }, []);

  return {
    errors,
    valid: Object.keys(errors).length === 0,
    validateField,
    validateAll,
    setErrors,
    clearErrors,
    clearError
  };
};

export default useValidation;
