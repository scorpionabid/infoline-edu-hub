import { useState, useCallback } from 'react';
import { ColumnValidationError, CategoryEntryData } from '@/types/dataEntry';
import { Column } from '@/types/column';

/**
 * @description Formun validasiyası üçün hook
 */
export const useValidation = (categories: any[] = [], entries: CategoryEntryData[] = []) => {
  const [validationErrors, setValidationErrors] = useState<ColumnValidationError[]>([]);
  
  // Bir girişin validasiyası
  const validateEntry = useCallback((entry: CategoryEntryData, columns: Record<string, Column>): boolean => {
    const errors: ColumnValidationError[] = [];
    
    // Get all columns for this category
    const categoryColumns = categories.find(c => c.id === entry.categoryId)?.columns || [];
    
    // Check each required column
    categoryColumns.forEach(column => {
      if (column.is_required) {
        const valueObj = entry.values.find(v => v.columnId === column.id);
        const value = valueObj?.value;
        
        if (isEmptyValue(value)) {
          errors.push({
            columnId: column.id,
            message: `${column.name} is required`,
            severity: 'error'
          });
        }
      }
    });
    
    // Add to global errors
    setValidationErrors(prev => [
      ...prev.filter(e => !categoryColumns.some(col => col.id === e.columnId)),
      ...errors
    ]);
    
    return errors.length === 0;
  }, [categories]);
  
  // Bütün giriş qeydlərinin validasiyası
  const validateAllEntries = useCallback((entries: CategoryEntryData[], columns: Record<string, Column>): boolean => {
    let isValid = true;
    const allErrors: ColumnValidationError[] = [];
    
    entries.forEach(entry => {
      const categoryColumns = categories.find(c => c.id === entry.categoryId)?.columns || [];
      
      categoryColumns.forEach(column => {
        if (column.is_required) {
          const valueObj = entry.values.find(v => v.columnId === column.id);
          const value = valueObj?.value;
          
          if (isEmptyValue(value)) {
            allErrors.push({
              columnId: column.id,
              message: `${column.name} is required`,
              severity: 'error'
            });
            isValid = false;
          }
        }
      });
    });
    
    setValidationErrors(allErrors);
    return isValid;
  }, [categories]);
  
  // Sütun üçün xəta mesajını əldə et
  const getColumnErrorMessage = useCallback((columnId: string): string | undefined => {
    const error = validationErrors.find(err => err.columnId === columnId);
    return error?.message;
  }, [validationErrors]);
  
  // Dəyərin boş olub olmadığını yoxla
  const isEmptyValue = (value: any): boolean => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  };
  
  return {
    validationErrors,
    validateAllEntries,
    validateEntry,
    getColumnErrorMessage,
    getValidationErrorsForCategory: useCallback((categoryId: string) => {
      return validationErrors.filter(err => {
        const column = categories.find(c => 
          c.columns.some(col => col.id === err.columnId)
        );
        return column?.id === categoryId;
      });
    }, [validationErrors, categories]),
    isEmptyValue
  };
};
