
import { useState, useCallback } from 'react';
import { Column } from '@/types/column';
import { EntryValidation } from '@/types/entry';

export const useEntryValidation = () => {
  const [validation, setValidation] = useState<EntryValidation>({
    isValid: true,
    errors: {}
  });

  const validateField = useCallback((value: string, column: Column): string[] => {
    const errors: string[] = [];
    
    if (column.is_required && (!value || value.trim() === '')) {
      errors.push('Bu sahə məcburidir');
    }

    if (column.validation) {
      const { minLength, maxLength, pattern } = column.validation;

      if (minLength && value.length < minLength) {
        errors.push(`Minimum ${minLength} simvol olmalıdır`);
      }

      if (maxLength && value.length > maxLength) {
        errors.push(`Maksimum ${maxLength} simvol olmalıdır`);
      }

      if (pattern && !new RegExp(pattern).test(value)) {
        errors.push(column.validation.customMessage || 'Düzgün format deyil');
      }
    }

    return errors;
  }, []);

  const validateAllFields = useCallback((entries: Array<{columnId: string; value: string}>, columns: Record<string, Column>): EntryValidation => {
    const newValidation: EntryValidation = {
      isValid: true,
      errors: {}
    };

    entries.forEach(entry => {
      const column = columns[entry.columnId];
      if (column) {
        const fieldErrors = validateField(entry.value, column);
        if (fieldErrors.length > 0) {
          newValidation.errors[entry.columnId] = fieldErrors;
          newValidation.isValid = false;
        }
      }
    });

    setValidation(newValidation);
    return newValidation;
  }, [validateField]);

  return {
    validation,
    validateField,
    validateAllFields
  };
};
