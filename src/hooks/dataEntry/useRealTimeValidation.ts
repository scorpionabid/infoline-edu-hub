
import { useMemo } from 'react';
import { Column } from '@/types/column';

interface UseRealTimeValidationProps {
  columns: Column[];
  formData: Record<string, any>;
  enabled?: boolean;
}

export const useRealTimeValidation = ({
  columns,
  formData,
  enabled = true
}: UseRealTimeValidationProps) => {
  const validationResult = useMemo(() => {
    if (!enabled) return { errors: {}, warnings: {}, isValid: true, hasAllRequiredFields: true };

    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    columns.forEach(column => {
      const value = formData[column.id];
      
      // Required field validation
      if (column.is_required && (!value || String(value).trim() === '')) {
        errors[column.id] = `${column.name} sahəsi tələb olunur`;
      }

      // Type-based validation
      if (value && column.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[column.id] = 'Email formatı düzgün deyil';
        }
      }

      if (value && column.type === 'number') {
        if (isNaN(Number(value))) {
          errors[column.id] = 'Rəqəm daxil edin';
        }
      }
    });

    const hasAllRequiredFields = columns
      .filter(col => col.is_required)
      .every(col => {
        const value = formData[col.id];
        return value && String(value).trim() !== '';
      });

    return {
      errors,
      warnings,
      isValid: Object.keys(errors).length === 0,
      hasAllRequiredFields
    };
  }, [columns, formData, enabled]);

  return validationResult;
};
