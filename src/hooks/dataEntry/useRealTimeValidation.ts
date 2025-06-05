
import { useMemo } from 'react';
import { Column } from '@/types/column';

export interface UseRealTimeValidationOptions {
  columns: Column[];
  formData: Record<string, any>;
  enabled?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export function useRealTimeValidation({
  columns,
  formData,
  enabled = true
}: UseRealTimeValidationOptions) {
  const errors = useMemo(() => {
    if (!enabled) return [];
    
    const validationErrors: ValidationError[] = [];
    
    columns.forEach(column => {
      if (column.is_required) {
        const value = formData[column.id];
        if (!value || String(value).trim() === '') {
          validationErrors.push({
            field: column.id,
            message: `${column.name} is required`
          });
        }
      }
    });
    
    return validationErrors;
  }, [columns, formData, enabled]);

  const warnings = useMemo(() => {
    const validationWarnings: ValidationWarning[] = [];
    // Add warning logic here if needed
    return validationWarnings;
  }, []);

  const isValid = useMemo(() => {
    return errors.length === 0;
  }, [errors]);

  const hasAllRequiredFields = useMemo(() => {
    const requiredColumns = columns.filter(col => col.is_required);
    return requiredColumns.every(column => {
      const value = formData[column.id];
      return value && String(value).trim() !== '';
    });
  }, [columns, formData]);

  return {
    errors,
    warnings,
    isValid,
    hasAllRequiredFields
  };
}

export default useRealTimeValidation;
