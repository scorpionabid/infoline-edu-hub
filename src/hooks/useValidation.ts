
import { useState, useCallback } from 'react';
import { CategoryWithColumns, Column } from '@/types/column';
import { CategoryEntryData, ColumnValidationError } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { formatValueByType, isEmptyValue, validateColumnValue } from '@/utils/validation';

export const useValidation = (categories: CategoryWithColumns[], entries: CategoryEntryData[]) => {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<ColumnValidationError[]>([]);

  // Bütün formu validasiya etmək üçün metod
  const validateForm = useCallback(() => {
    const newErrors: ColumnValidationError[] = [];
    let isValid = true;

    // Əgər kateqoriya seçilməyibsə, formun validasiyasını keçmiş sayırıq
    if (categories.length === 0) {
      return true;
    }

    // Hər bir kateqoriyanı yoxlayırıq
    categories.forEach(category => {
      const entry = entries.find(e => e.categoryId === category.id);
      if (!entry) return;

      // Kateqoriyanın sütunlarını yoxlayırıq
      category.columns.forEach(column => {
        const valueObj = entry.values.find(v => v.columnId === column.id);
        const value = valueObj ? valueObj.value : undefined;
        
        // Sütunun dəyərini tipinə görə validasiya edirik
        const error = validateColumnValue(value, column.type, column.is_required, column.validation);
        
        if (error) {
          isValid = false;
          newErrors.push({
            columnId: column.id,
            message: error,
            severity: 'error'
          });
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  }, [categories, entries]);

  // Xüsusi bir sütun üçün xəta mesajını qaytarmaq
  const getErrorForColumn = useCallback((columnId: string) => {
    return errors.find(error => error.columnId === columnId);
  }, [errors]);

  // Form dəyərləri dəyişdikdə validasiya etmək  
  const validateField = useCallback((columnId: string, value: any, columnType: string, isRequired: boolean, validation: any) => {
    const error = validateColumnValue(value, columnType, isRequired, validation);
    
    setErrors(prevErrors => {
      // Əvvəlki xətalardan bu sütunla bağlı olanları çıxarmaq
      const filteredErrors = prevErrors.filter(e => e.columnId !== columnId);
      
      // Əgər yeni xəta varsa, əlavə etmək
      if (error) {
        return [
          ...filteredErrors,
          {
            columnId,
            message: error,
            severity: 'error'
          }
        ];
      }
      
      return filteredErrors;
    });
    
    return !error;
  }, []);

  return {
    errors,
    validateForm,
    validateField,
    getErrorForColumn
  };
};

// Validation utility function stub - you need to implement this in the validation.ts file
function validateColumnValue(value: any, type: string, isRequired: boolean, validation: any): string | null {
  // Basic validation
  if (isRequired && isEmptyValue(value)) {
    return 'Bu sahə məcburidir';
  }
  
  // Value is not required and is empty, so it's valid
  if (!isRequired && isEmptyValue(value)) {
    return null;
  }

  // Type-specific validation
  switch (type) {
    case 'number':
      if (isNaN(Number(value))) {
        return 'Rəqəm daxil edin';
      }
      
      if (validation?.minValue !== undefined && Number(value) < validation.minValue) {
        return `Minimum dəyər ${validation.minValue} olmalıdır`;
      }
      
      if (validation?.maxValue !== undefined && Number(value) > validation.maxValue) {
        return `Maksimum dəyər ${validation.maxValue} olmalıdır`;
      }
      break;
      
    case 'text':
    case 'textarea':
      if (validation?.minLength !== undefined && String(value).length < validation.minLength) {
        return `Minimum uzunluq ${validation.minLength} olmalıdır`;
      }
      
      if (validation?.maxLength !== undefined && String(value).length > validation.maxLength) {
        return `Maksimum uzunluq ${validation.maxLength} olmalıdır`;
      }
      
      if (validation?.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(String(value))) {
          return validation.patternError || 'Format düzgün deyil';
        }
      }
      break;
      
    case 'date':
      // Date validation
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Düzgün tarix formatı deyil';
      }
      
      if (validation?.minDate && new Date(value) < new Date(validation.minDate)) {
        return `Tarix ${validation.minDate} tarixindən sonra olmalıdır`;
      }
      
      if (validation?.maxDate && new Date(value) > new Date(validation.maxDate)) {
        return `Tarix ${validation.maxDate} tarixindən əvvəl olmalıdır`;
      }
      break;
  }
  
  return null;
}

// Helper function to check if a value is empty
function isEmptyValue(value: any): boolean {
  return value === undefined || value === null || value === '';
}

// Helper function for formatting values by their type
function formatValueByType(value: any, type: string): any {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'number':
      return isNaN(Number(value)) ? '' : Number(value);
    case 'date':
      try {
        return value ? new Date(value).toISOString().split('T')[0] : '';
      } catch (e) {
        return '';
      }
    default:
      return String(value);
  }
}
