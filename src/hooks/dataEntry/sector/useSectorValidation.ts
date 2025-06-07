
import { useState, useCallback, useMemo } from 'react';
import { Column } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';
import { ValidationResult } from '@/types/core/dataEntry';

interface SectorValidationOptions {
  columns: Column[];
  entries: DataEntry[];
  strictValidation?: boolean;
}

interface SectorValidationHook {
  validateForm: (data?: Record<string, any>) => ValidationResult;
  validateField: (columnId: string, value: any) => { valid: boolean; message?: string };
  getFieldError: (columnId: string) => string | undefined;
  hasErrors: boolean;
  errors: Record<string, string>;
  isValid: boolean;
}

export const useSectorValidation = ({
  columns,
  entries,
  strictValidation = false
}: SectorValidationOptions): SectorValidationHook => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate individual field
  const validateField = useCallback((columnId: string, value: any): { valid: boolean; message?: string } => {
    const column = columns.find(col => col.id === columnId);
    if (!column) {
      return { valid: false, message: 'Column not found' };
    }

    // Required field validation
    if (column.is_required && (!value || value.toString().trim() === '')) {
      return { valid: false, message: `${column.name} sahəsi mütləqdir` };
    }

    // Type-specific validation
    switch (column.type) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { valid: false, message: 'Düzgün email formatı daxil edin' };
        }
        break;
      
      case 'number':
        if (value && isNaN(Number(value))) {
          return { valid: false, message: 'Yalnız rəqəm daxil edin' };
        }
        break;
      
      case 'select':
        if (value && column.options && Array.isArray(column.options)) {
          const validOptions = column.options.map(opt => 
            typeof opt === 'string' ? opt : opt.value
          );
          if (!validOptions.includes(value)) {
            return { valid: false, message: 'Keçərli seçim edin' };
          }
        }
        break;
    }

    // Custom validation rules
    if (column.validation && typeof column.validation === 'object') {
      const validation = column.validation as any;
      
      if (validation.min && value && Number(value) < validation.min) {
        return { valid: false, message: `Minimum dəyər: ${validation.min}` };
      }
      
      if (validation.max && value && Number(value) > validation.max) {
        return { valid: false, message: `Maksimum dəyər: ${validation.max}` };
      }
      
      if (validation.pattern && value && !new RegExp(validation.pattern).test(value)) {
        return { valid: false, message: validation.message || 'Format düzgün deyil' };
      }
    }

    return { valid: true };
  }, [columns]);

  // Validate entire form
  const validateForm = useCallback((data?: Record<string, any>): ValidationResult => {
    const formData = data || {};
    const newErrors: Record<string, string> = {};
    let isValid = true;

    columns.forEach(column => {
      const value = formData[column.id];
      const fieldValidation = validateField(column.id, value);
      
      if (!fieldValidation.valid) {
        newErrors[column.id] = fieldValidation.message || 'Validation error';
        isValid = false;
      }
    });

    // Additional sector-specific validations
    if (strictValidation) {
      // Check for duplicate values where uniqueness is required
      const uniqueFields = columns.filter(col => 
        col.validation && (col.validation as any).unique
      );
      
      uniqueFields.forEach(column => {
        const value = formData[column.id];
        if (value) {
          const duplicateEntry = entries.find(entry => 
            entry.column_id === column.id && 
            entry.value === value
          );
          
          if (duplicateEntry) {
            newErrors[column.id] = 'Bu dəyər artıq mövcuddur';
            isValid = false;
          }
        }
      });
    }

    setErrors(newErrors);
    
    return {
      valid: isValid,
      errors: newErrors,
      message: isValid ? 'Validation successful' : 'Form has validation errors'
    };
  }, [columns, entries, validateField, strictValidation]);

  // Get error for specific field
  const getFieldError = useCallback((columnId: string): string | undefined => {
    return errors[columnId];
  }, [errors]);

  // Computed values
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);
  const isValid = useMemo(() => !hasErrors, [hasErrors]);

  return {
    validateForm,
    validateField,
    getFieldError,
    hasErrors,
    errors,
    isValid
  };
};
