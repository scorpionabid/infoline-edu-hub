
import React from 'react';
import { Column } from '@/types/column';
import { CategoryWithColumns } from '@/types/category';
import { ColumnValidationError, CategoryEntryData } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';

export const useValidation = () => {
  const { t } = useLanguage();
  const [errors, setErrors] = React.useState<ColumnValidationError[]>([]);

  // Bütün kateqoriyalar üzrə doğrulama
  const validateAllCategories = (categories: CategoryWithColumns[], formData: Record<string, any>) => {
    let allErrors: ColumnValidationError[] = [];
    
    // Hər bir kateqoriya üçün
    categories.forEach(category => {
      // Kateqoriyaya aid olan meydanlar tapmaq
      const categoryData = {
        categoryId: category.id,
        values: formData[category.id] || {}
      };
      
      // Bu kateqoriya üçün doğrulama
      const categoryErrors = validateCategory(category, categoryData);
      allErrors = [...allErrors, ...categoryErrors];
    });
    
    setErrors(allErrors);
    return allErrors.length === 0;
  };

  // Tək kateqoriya üçün doğrulama
  const validateCategory = (category: CategoryWithColumns, data: {categoryId: string, values: Record<string, any>}) => {
    const categoryErrors: ColumnValidationError[] = [];
    
    // Əgər kateqoriyada sütunlar yoxdursa boş array qaytar
    if (!category.columns || !Array.isArray(category.columns)) {
      return categoryErrors;
    }
    
    // Hər sütun üçün doğrulama
    category.columns.forEach(column => {
      const value = data.values[column.id];
      
      // Əgər mütləq doldurulmalı sahədirsə və boşdursa
      if (column.is_required && (!value || String(value).trim() === '')) {
        categoryErrors.push({
          field: column.name,
          columnId: column.id,
          type: 'required',
          message: t('fieldIsRequired', { field: column.name }),
          severity: 'error'
        });
        return;
      }
      
      // Digər doğrulama qaydaları - type məcburi sahədir
      if (value && column.validation) {
        // Rəqəm tipli sütunlar üçün
        if (column.type === 'number') {
          const numValue = parseFloat(value);
          
          if (isNaN(numValue)) {
            categoryErrors.push({
              field: column.name,
              columnId: column.id,
              type: 'type',
              message: t('mustBeNumber', { field: column.name }),
              severity: 'error'
            });
          } else {
            // Min/max doğrulaması
            if (column.validation.min !== undefined && numValue < column.validation.min) {
              categoryErrors.push({
                field: column.name,
                columnId: column.id,
                type: 'min',
                message: t('minValue', { field: column.name, min: column.validation.min }),
                severity: 'error'
              });
            }
            
            if (column.validation.max !== undefined && numValue > column.validation.max) {
              categoryErrors.push({
                field: column.name,
                columnId: column.id,
                type: 'max',
                message: t('maxValue', { field: column.name, max: column.validation.max }),
                severity: 'error'
              });
            }
          }
        }
        
        // Mətn tipli sütunlar üçün
        if ((column.type === 'text' || column.type === 'textarea') && column.validation.pattern) {
          try {
            const regex = new RegExp(column.validation.pattern);
            if (!regex.test(String(value))) {
              categoryErrors.push({
                field: column.name,
                columnId: column.id,
                type: 'pattern',
                message: column.validation.customMessage || 
                  t('patternMismatch', { field: column.name }),
                severity: 'error'
              });
            }
          } catch (error) {
            console.error('Yanlış regex pattern:', column.validation.pattern);
          }
        }
      }
    });
    
    return categoryErrors;
  };

  return {
    errors,
    validateAllCategories,
    validateCategory
  };
};

export default useValidation;
