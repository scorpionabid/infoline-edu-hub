
import { useState, useMemo } from 'react';
import { Column } from '@/types/column';
import { ColumnValidationError, CategoryEntryData } from '@/types/dataEntry';

export const useValidation = (columns: Column[], categoryData: CategoryEntryData[]) => {
  const [errors, setErrors] = useState<ColumnValidationError[]>([]);
  
  const validateAll = useMemo(() => {
    const allErrors: ColumnValidationError[] = [];
    
    if (!categoryData || categoryData.length === 0 || !columns || columns.length === 0) {
      return { errors: allErrors, isValid: true };
    }
    
    categoryData.forEach(category => {
      if (!category || !category.values) return;
      
      const categoryColumns = columns.filter(col => col.category_id === category.categoryId);
      
      categoryColumns.forEach(column => {
        if (!column.is_required) return;
        
        const entry = category.values?.find(e => e.columnId === column.id);
        
        if (!entry || entry.value === undefined || entry.value === null || entry.value === '') {
          allErrors.push({
            columnId: column.id,
            columnName: column.name,
            message: `${column.name} is required`,
            severity: 'error',
            categoryId: category.categoryId
          });
        }
      });
    });
    
    setErrors(allErrors);
    return { errors: allErrors, isValid: allErrors.length === 0 };
  }, [columns, categoryData]);
  
  const validateCategory = (category: CategoryEntryData) => {
    const categoryErrors: ColumnValidationError[] = [];
    
    if (!category || !category.values) {
      return { errors: categoryErrors, isValid: true };
    }
    
    const categoryColumns = columns.filter(col => col.category_id === category.categoryId);
    
    categoryColumns.forEach(column => {
      if (!column.is_required) return;
      
      const entry = category.values?.find(e => e.columnId === column.id);
      
      if (!entry || entry.value === undefined || entry.value === null || entry.value === '') {
        categoryErrors.push({
          columnId: column.id,
          columnName: column.name,
          message: `${column.name} is required`,
          severity: 'error',
          categoryId: category.categoryId
        });
      }
    });
    
    return { errors: categoryErrors, isValid: categoryErrors.length === 0 };
  };
  
  return {
    errors,
    isValid: errors.length === 0,
    validateAll,
    validateCategory
  };
};

export default useValidation;
