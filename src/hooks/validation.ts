import { useState, useCallback } from 'react';
import { ColumnValidationError, CategoryEntryData } from '@/types/dataEntry';
import { Column } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

/**
 * @description Formun validasiyası üçün hook
 */
export const useValidation = (categories: any[] = [], entries: CategoryEntryData[] = []) => {
  const [validationErrors, setValidationErrors] = useState<ColumnValidationError[]>([]);
  const { t } = useLanguage();
  
  // Validasiya funksiyası 
  const validateForm = useCallback((): boolean => {
    const newErrors: ColumnValidationError[] = [];

    if (!categories || !entries) return true;
    
    // Add validation logic here
    // This is just a placeholder implementation
    
    setValidationErrors(newErrors);
    return newErrors.length === 0;
  }, [categories, entries]);
  
  // Sütun üçün xəta mesajını əldə et
  const getErrorForColumn = useCallback((columnId: string): string | undefined => {
    const error = validationErrors.find(err => err.columnId === columnId);
    if (error) return error.message;
    
    return undefined;
  }, [validationErrors]);
  
  // Dəyərin boş olub olmadığını yoxla
  const isEmptyValue = (value: any): boolean => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  };
  
  // Return the validation methods and state
  return {
    errors: validationErrors,
    validateForm,
    getErrorForColumn,
    getValidationErrorsForCategory: useCallback((categoryId: string) => {
      return validationErrors.filter(err => err.categoryId === categoryId);
    }, [validationErrors]),
    isEmptyValue
  };
};
