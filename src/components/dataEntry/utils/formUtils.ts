import { Column, ColumnValidationError } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';

export const validateRequiredFields = (
  columns: Column[],
  entries: DataEntry[]
): ColumnValidationError[] => {
  const errors: ColumnValidationError[] = [];
  
  columns.forEach(column => {
    if (column.is_required) {
      const entry = entries.find(e => e.column_id === column.id);
      if (!entry || !entry.value || entry.value.trim() === '') {
        errors.push({
          columnId: column.id,
          columnName: column.name,
          type: 'required',
          message: 'Bu sahə məcburidir'
        });
      }
    }
  });

  return errors;
};

export const validateColumnType = (
  column: Column,
  value: string
): ColumnValidationError | null => {
  if (!value) return null;

  switch (column.type) {
    case 'email':
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return {
          columnId: column.id,
          columnName: column.name,
          type: 'format',
          message: 'Düzgün email formatı daxil edin'
        };
      }
      break;
    
    case 'number':
      if (isNaN(Number(value))) {
        return {
          columnId: column.id,
          columnName: column.name,
          type: 'format',
          message: 'Rəqəm daxil edin'
        };
      }
      break;
  }

  return null;
};
