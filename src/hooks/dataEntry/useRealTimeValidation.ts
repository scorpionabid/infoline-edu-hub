
import { useMemo } from 'react';
import { Column } from '@/types/column';

interface UseRealTimeValidationOptions {
  columns: Column[];
  data: Record<string, any>;
}

export const useRealTimeValidation = ({
  columns,
  // data
}: UseRealTimeValidationOptions) => {
  
  const errors = useMemo(() => {
    const validationErrors: Record<string, string> = {};
    
    columns.forEach(column => {
      const value = data[column.id];
      
      // Required field validation
      if (column.is_required && (!value || value.toString().trim() === '')) {
        validationErrors[column.id] = `${column.name} sahəsi məcburidir`;
      }
      
      // Type validation
      if (value && column.type === 'number') {
        if (isNaN(Number(value))) {
          validationErrors[column.id] = `${column.name} sahəsi rəqəm olmalıdır`;
        }
      }
      
      // Date validation
      if (value && column.type === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          validationErrors[column.id] = `${column.name} sahəsində keçərli tarix daxil edin`;
        }
      }
    });
    
    return validationErrors;
  }, [columns, data]);
  
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);
  
  return {
    errors,
    isValid,
    hasErrors: Object.keys(errors).length > 0
  };
};
