
import { useState, useEffect, useCallback } from 'react';
import { Column } from '@/types/column';

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface UseRealTimeValidationOptions {
  columns: Column[];
  formData: Record<string, any>;
  enabled?: boolean;
}

export interface UseRealTimeValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
  isValid: boolean;
  hasAllRequiredFields: boolean;
  validateField: (fieldId: string, value: any) => ValidationError | null;
}

export const useRealTimeValidation = ({
  columns,
  formData,
  enabled = true
}: UseRealTimeValidationOptions): UseRealTimeValidationResult => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);

  const validateField = useCallback((fieldId: string, value: any): ValidationError | null => {
    const column = columns.find(col => col.id === fieldId);
    if (!column) return null;

    // Required field validation
    if (column.is_required && (!value || String(value).trim() === '')) {
      return {
        field: fieldId,
        message: `${column.name} sahəsi tələb olunur`,
        type: 'error'
      };
    }

    // Type-specific validation
    if (value && String(value).trim() !== '') {
      switch (column.type) {
        case 'number':
          if (isNaN(Number(value))) {
            return {
              field: fieldId,
              message: `${column.name} sahəsi yalnız rəqəm olmalıdır`,
              type: 'error'
            };
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            return {
              field: fieldId,
              message: `${column.name} sahəsi düzgün e-poçt formatında olmalıdır`,
              type: 'error'
            };
          }
          break;
      }
    }

    return null;
  }, [columns]);

  // Real-time validation
  useEffect(() => {
    if (!enabled) return;

    const newErrors: ValidationError[] = [];
    const newWarnings: ValidationError[] = [];

    columns.forEach(column => {
      const value = formData[column.id];
      const validation = validateField(column.id, value);
      
      if (validation) {
        if (validation.type === 'error') {
          newErrors.push(validation);
        } else {
          newWarnings.push(validation);
        }
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);
  }, [formData, columns, enabled, validateField]);

  const isValid = errors.length === 0;
  const hasAllRequiredFields = columns
    .filter(col => col.is_required)
    .every(col => {
      const value = formData[col.id];
      return value && String(value).trim() !== '';
    });

  return {
    errors,
    warnings,
    isValid,
    hasAllRequiredFields,
    validateField
  };
};

export default useRealTimeValidation;
