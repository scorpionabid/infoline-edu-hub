
import { useState, useCallback } from 'react';
import { Column } from '@/types/column';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseValidationResult {
  errors: ValidationError[];
  isValid: boolean;
  validate: (formData: Record<string, any>, columns: Column[]) => boolean;
  clearErrors: () => void;
  addError: (field: string, message: string) => void;
}

export const useValidation = (): UseValidationResult => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validate = useCallback((formData: Record<string, any>, columns: Column[]): boolean => {
    const newErrors: ValidationError[] = [];

    columns.forEach(column => {
      const value = formData[column.id];
      
      // Required field validation
      if (column.is_required && (!value || String(value).trim() === '')) {
        newErrors.push({
          field: column.id,
          message: `${column.name} sahəsi tələb olunur`
        });
      }

      // Type-specific validation
      if (value && String(value).trim() !== '') {
        switch (column.type) {
          case 'number':
            if (isNaN(Number(value))) {
              newErrors.push({
                field: column.id,
                message: `${column.name} sahəsi yalnız rəqəm olmalıdır`
              });
            }
            break;
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(String(value))) {
              newErrors.push({
                field: column.id,
                message: `${column.name} sahəsi düzgün e-poçt formatında olmalıdır`
              });
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const addError = useCallback((field: string, message: string) => {
    setErrors(prev => [...prev, { field, message }]);
  }, []);

  return {
    errors,
    isValid: errors.length === 0,
    validate,
    clearErrors,
    addError
  };
};

export default useValidation;
