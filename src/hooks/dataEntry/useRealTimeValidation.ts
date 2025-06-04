
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Column } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

export interface ValidationError {
  columnId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface UseRealTimeValidationProps {
  columns: Column[];
  formData: Record<string, any>;
  enabled?: boolean;
}

/**
 * Real-time validation hook for form fields
 * Validates form fields in real-time and shows errors/warnings
 */
export function useRealTimeValidation({
  columns,
  formData,
  enabled = true
}: UseRealTimeValidationProps) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  
  // Validate individual field
  const validateField = useCallback((column: Column, value: any): ValidationError[] => {
    const fieldErrors: ValidationError[] = [];
    
    if (!enabled) return fieldErrors;
    
    // Check required fields
    if (column.is_required && (!value || String(value).trim() === '')) {
      fieldErrors.push({
        columnId: column.id,
        message: t('fieldRequired') || `${column.name} is required`,
        severity: 'error'
      });
      return fieldErrors;
    }
    
    // Skip validation if value is empty (but not required)
    if (!value || String(value).trim() === '') {
      return fieldErrors;
    }
    
    // Type-based validation
    switch (column.type) {
      case 'number':
        if (isNaN(Number(value))) {
          fieldErrors.push({
            columnId: column.id,
            message: t('fieldMustBeNumber') || `${column.name} must be a number`,
            severity: 'error'
          });
        } else {
          const numValue = Number(value);
          
          // Min/max validation
          if (column.validation) {
            const validation = column.validation as any;
            
            if (validation.min !== undefined && numValue < validation.min) {
              fieldErrors.push({
                columnId: column.id,
                message: t('fieldMinValue') || `${column.name} must be at least ${validation.min}`,
                severity: 'error'
              });
            }
            
            if (validation.max !== undefined && numValue > validation.max) {
              fieldErrors.push({
                columnId: column.id,
                message: t('fieldMaxValue') || `${column.name} must be at most ${validation.max}`,
                severity: 'error'
              });
            }
          }
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          fieldErrors.push({
            columnId: column.id,
            message: t('fieldInvalidEmail') || `${column.name} must be a valid email`,
            severity: 'error'
          });
        }
        break;
    }
    
    return fieldErrors;
  }, [enabled, t]);
  
  // Validate all fields
  const validateAllFields = useCallback(() => {
    if (!enabled) {
      setErrors([]);
      setWarnings([]);
      return;
    }
    
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    
    columns.forEach(column => {
      const value = formData[column.id];
      const fieldErrors = validateField(column, value);
      
      fieldErrors.forEach(error => {
        if (error.severity === 'error') {
          allErrors.push(error);
        } else if (error.severity === 'warning') {
          allWarnings.push(error);
        }
      });
    });
    
    setErrors(allErrors);
    setWarnings(allWarnings);
  }, [enabled, columns, formData, validateField]);
  
  // Validate when form data changes
  useEffect(() => {
    validateAllFields();
  }, [validateAllFields]);
  
  // Get error for specific field
  const getFieldError = useCallback((columnId: string): ValidationError | undefined => {
    return errors.find(error => error.columnId === columnId);
  }, [errors]);
  
  // Get warning for specific field
  const getFieldWarning = useCallback((columnId: string): ValidationError | undefined => {
    return warnings.find(warning => warning.columnId === columnId);
  }, [warnings]);
  
  // Is form valid?
  const isValid = useMemo(() => {
    return errors.length === 0;
  }, [errors]);
  
  // Are all required fields filled?
  const hasAllRequiredFields = useMemo(() => {
    const requiredColumns = columns.filter(col => col.is_required);
    return requiredColumns.every(col => {
      const value = formData[col.id];
      return value && String(value).trim() !== '';
    });
  }, [columns, formData]);
  
  return {
    errors,
    warnings,
    isValid,
    hasAllRequiredFields,
    getFieldError,
    getFieldWarning,
    validateField,
    validateAllFields
  };
}

export default useRealTimeValidation;
