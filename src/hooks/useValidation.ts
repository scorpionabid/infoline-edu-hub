
import { useState, useCallback } from 'react';
import { Column } from '@/types/column';
import { CategoryEntryData, ColumnValidationError } from '@/types/dataEntry';
import { validateColumnValue, isEmptyValue, formatValueByType } from '@/utils/validation';

/**
 * Form validasiyası üçün custom hook
 */
export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ColumnValidationError[]>([]);

  /**
   * Bütün məlumatların validasiyası üçün
   */
  const validateAllEntries = useCallback((entries: CategoryEntryData[], columns: Record<string, Column>): boolean => {
    const errors: ColumnValidationError[] = [];

    entries.forEach(category => {
      category.values.forEach(entry => {
        const column = columns[entry.columnId];
        if (column) {
          const validationResult = validateColumnValue(column, entry.value);
          if (validationResult) {
            errors.push(validationResult);
          }
        }
      });
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, []);

  /**
   * Bir sütun üçün validasiya
   */
  const validateEntry = useCallback((column: Column, value: any): ColumnValidationError | null => {
    const error = validateColumnValue(column, value);
    
    if (error) {
      setValidationErrors(prev => {
        // Əvvəlcə eyni sütun ID-si ilə olan xətanı təmizlə
        const filtered = prev.filter(e => e.columnId !== column.id);
        // Sonra yenisini əlavə et
        return [...filtered, error];
      });
      return error;
    } else {
      // Xəta yoxdursa, bu sütunla əlaqəli xətaları təmizlə
      setValidationErrors(prev => prev.filter(e => e.columnId !== column.id));
      return null;
    }
  }, []);

  /**
   * Validasiya xətalarını sıfırla
   */
  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  /**
   * Konkret bir sütunun validasiya xətasını götür
   */
  const getErrorForColumn = useCallback((columnId: string): ColumnValidationError | undefined => {
    return validationErrors.find(error => error.columnId === columnId);
  }, [validationErrors]);

  return {
    validationErrors,
    validateAllEntries,
    validateEntry,
    clearValidationErrors,
    getErrorForColumn,
    formatValueByType,
    isEmptyValue
  };
};
