
import { useState, useCallback } from 'react';
import { ColumnValidationError } from '@/types/dataEntry';
import { CategoryWithColumns } from '@/types/column';

export const useValidation = (categories: CategoryWithColumns[], entries: any[]) => {
  const [errors, setErrors] = useState<ColumnValidationError[]>([]);
  
  // Formanı validasiya etmək
  const validateForm = useCallback(() => {
    const newErrors: ColumnValidationError[] = [];
    
    categories.forEach(category => {
      const categoryEntry = entries.find(entry => entry.categoryId === category.id);
      
      if (categoryEntry) {
        category.columns.forEach(column => {
          if (column.isRequired) {
            const valueObj = categoryEntry.values.find((v: any) => v.columnId === column.id);
            const value = valueObj?.value;
            
            if (value === undefined || value === null || value === '') {
              newErrors.push({
                columnId: column.id,
                message: `"${category.name}" kateqoriyasında "${column.name}" doldurulmalıdır`
              });
              
              // Value obyektinə error mesajı əlavə edək
              if (valueObj) {
                valueObj.errorMessage = `${column.name} doldurulmalıdır`;
              }
            } else if (column.type === 'number' && column.validationRules) {
              const numValue = Number(value);
              
              if (isNaN(numValue)) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" rəqəm olmalıdır`
                });
                
                if (valueObj) {
                  valueObj.errorMessage = `${column.name} rəqəm olmalıdır`;
                }
              } else {
                if (column.validationRules.minValue !== undefined && numValue < column.validationRules.minValue) {
                  newErrors.push({
                    columnId: column.id,
                    message: `"${category.name}" kateqoriyasında "${column.name}" minimum ${column.validationRules.minValue} olmalıdır`
                  });
                  
                  if (valueObj) {
                    valueObj.errorMessage = `Minimum ${column.validationRules.minValue} olmalıdır`;
                  }
                }
                
                if (column.validationRules.maxValue !== undefined && numValue > column.validationRules.maxValue) {
                  newErrors.push({
                    columnId: column.id,
                    message: `"${category.name}" kateqoriyasında "${column.name}" maksimum ${column.validationRules.maxValue} olmalıdır`
                  });
                  
                  if (valueObj) {
                    valueObj.errorMessage = `Maksimum ${column.validationRules.maxValue} olmalıdır`;
                  }
                }
              }
            }
          }
        });
      }
    });
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [categories, entries]);
  
  // Sütun üçün xəta mesajını almaq
  const getErrorForColumn = useCallback((columnId: string, entryValues: any[]) => {
    const error = errors.find(err => err.columnId === columnId);
    if (error) return error.message;
    
    // Alternativ olaraq, entry məlumatlarından da xəta mesajını ala bilərik
    for (const valueObj of entryValues) {
      if (valueObj.columnId === columnId && valueObj.errorMessage) {
        return valueObj.errorMessage;
      }
    }
    
    return undefined;
  }, [errors]);
  
  return {
    errors,
    validateForm,
    getErrorForColumn
  };
};
