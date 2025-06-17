
import { useMemo } from 'react';
import { Column } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';

interface UseSectorValidationOptions {
  columns: Column[];
  entries: DataEntry[];
  strictValidation?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const useSectorValidation = ({
  columns,
  entries,
  strictValidation = false
}: UseSectorValidationOptions) => {
  
  const validateForm = (formData: Record<string, any>): ValidationResult => {
    const errors: Record<string, string> = {};
    
    columns.forEach(column => {
      const value = formData[column.id];
      
      // Required field validation
      if (column.is_required && (!value || value.toString().trim() === '')) {
        errors[column.id] = `${column.name} sahəsi məcburidir`;
      }
      
      // Type validation
      if (value && column.type === 'number') {
        if (isNaN(Number(value))) {
          errors[column.id] = `${column.name} sahəsi rəqəm olmalıdır`;
        }
      }
      
      // Date validation
      if (value && column.type === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors[column.id] = `${column.name} sahəsində keçərli tarix daxil edin`;
        }
      }
    });
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  const errors = useMemo(() => {
    const formData = entries.reduce((acc, entry) => {
      // Use the values array from DataEntry
      entry.values.forEach(entryValue => {
        acc[entryValue.column_id] = entryValue.value;
      });
      return acc;
    }, {} as Record<string, any>);
    
    return validateForm(formData).errors;
  }, [entries, columns]);
  
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);
  
  return {
    validateForm,
    errors,
    isValid
  };
};
