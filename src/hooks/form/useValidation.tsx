import { useState, useCallback, useEffect } from 'react';
import { ColumnValidationError } from '@/types/dataEntry';
import { CategoryWithColumns, Column, ValidationRules, DependsOnCondition } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { Json } from '@/integrations/supabase/types';

export const useValidation = (categories: CategoryWithColumns[], entries: any[]) => {
  const [errors, setErrors] = useState<ColumnValidationError[]>([]);
  const [warnings, setWarnings] = useState<ColumnValidationError[]>([]);
  const { t } = useLanguage();
  
  useEffect(() => {
    if (categories.length > 0 && entries.length > 0) {
      validateForm();
    }
  }, [categories, entries]);
  
  const validateForm = useCallback((): boolean => {
    const newErrors: ColumnValidationError[] = [];
    const newWarnings: ColumnValidationError[] = [];
    
    categories.forEach(category => {
      const categoryEntry = entries.find(entry => entry.categoryId === category.id);
      
      if (categoryEntry) {
        category.columns.forEach(column => {
          if (column.is_required) {
            const valueObj = categoryEntry.values.find((v: any) => v.columnId === column.id);
            const value = valueObj?.value;
            
            if (value === undefined || value === null || value === '') {
              newErrors.push({
                columnId: column.id,
                message: `"${category.name}" kateqoriyasında "${column.name}" doldurulmalıdır`,
                categoryId: category.id
              });
              
              if (valueObj) {
                valueObj.errorMessage = t('fieldRequired');
              }
            }
          }
          
          const valueObj = categoryEntry.values.find((v: any) => v.columnId === column.id);
          
          if (valueObj && valueObj.value !== undefined && valueObj.value !== null && valueObj.value !== '') {
            const value = valueObj.value;
            
            if (column.type === 'number') {
              const numValue = Number(value);
              
              if (isNaN(numValue)) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" rəqəm olmalıdır`,
                  categoryId: category.id
                });
                
                valueObj.errorMessage = t('mustBeNumber');
              } else {
                // Validate min/max rules
                if (column.validation_rules) {
                  const rules = column.validation_rules as ValidationRules;
                  
                  if (rules.min !== undefined && numValue < rules.min) {
                    newErrors.push({
                      columnId: column.id,
                      message: `"${category.name}" kateqoriyasında "${column.name}" ${rules.min}-dən kiçik ola bilməz`,
                      categoryId: category.id
                    });
                    
                    valueObj.errorMessage = t('minValueViolation', { min: rules.min });
                  }
                  
                  if (rules.max !== undefined && numValue > rules.max) {
                    newErrors.push({
                      columnId: column.id,
                      message: `"${category.name}" kateqoriyasında "${column.name}" ${rules.max}-dən böyük ola bilməz`,
                      categoryId: category.id
                    });
                    
                    valueObj.errorMessage = t('maxValueViolation', { max: rules.max });
                  }
                  
                  // Xəbərdarlıqlar üçün thresholdların yoxlanılması
                  if (rules.warn_above !== undefined && numValue > rules.warn_above) {
                    newWarnings.push({
                      columnId: column.id,
                      message: `"${category.name}" kateqoriyasında "${column.name}" ${rules.warn_above}-dən yuxarıdır. Bu dəyər gözləniləndən yüksək görünür.`,
                      categoryId: category.id
                    });
                    
                    valueObj.warningMessage = t('valueAboveThreshold', { threshold: rules.warn_above });
                  }
                  
                  if (rules.warn_below !== undefined && numValue < rules.warn_below) {
                    newWarnings.push({
                      columnId: column.id,
                      message: `"${category.name}" kateqoriyasında "${column.name}" ${rules.warn_below}-dən aşağıdır. Bu dəyər gözləniləndən aşağı görünür.`,
                      categoryId: category.id
                    });
                    
                    valueObj.warningMessage = t('valueBelowThreshold', { threshold: rules.warn_below });
                  }
                }
              }
            } else if (column.type === 'email') {
              // Email validasiyası
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" düzgün email formatında olmalıdır`,
                  categoryId: category.id
                });
                
                valueObj.errorMessage = t('invalidEmailFormat');
              }
            } else if (column.type === 'phone') {
              // Telefon nömrəsi validasiyası
              const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
              if (!phoneRegex.test(value)) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" düzgün telefon formatında olmalıdır`,
                  categoryId: category.id
                });
                
                valueObj.errorMessage = t('invalidPhoneFormat');
              }
            } else if (column.type === 'date') {
              // Tarix validasiyası
              const dateValue = new Date(value);
              
              if (isNaN(dateValue.getTime())) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" düzgün tarix formatında olmalıdır`,
                  categoryId: category.id
                });
                
                valueObj.errorMessage = t('invalidDateFormat');
              } else if (column.validation_rules) {
                const rules = column.validation_rules as ValidationRules;
                
                if (rules.min_date) {
                  const minDate = new Date(rules.min_date);
                  
                  if (dateValue < minDate) {
                    newErrors.push({
                      columnId: column.id,
                      message: `"${category.name}" kateqoriyasında "${column.name}" ${rules.min_date} tarixindən əvvəl ola bilməz`,
                      categoryId: category.id
                    });
                    
                    valueObj.errorMessage = t('dateBeforeMinDate', { date: rules.min_date });
                  }
                }
                
                if (rules.max_date) {
                  const maxDate = new Date(rules.max_date);
                  
                  if (dateValue > maxDate) {
                    newErrors.push({
                      columnId: column.id,
                      message: `"${category.name}" kateqoriyasında "${column.name}" ${rules.max_date} tarixindən sonra ola bilməz`,
                      categoryId: category.id
                    });
                    
                    valueObj.errorMessage = t('dateAfterMaxDate', { date: rules.max_date });
                  }
                }
              }
            }
            
            // Asılılıq validasiyası
            if (column.depends_on && column.depends_on.length > 0) {
              column.depends_on.forEach((dependency: DependsOnCondition) => {
                const dependsOnColumn = category.columns.find(c => c.id === dependency.column_id);
                
                if (dependsOnColumn) {
                  const dependsOnValue = categoryEntry.values.find((v: any) => v.columnId === dependency.column_id)?.value;
                  
                  if (dependsOnValue !== undefined && dependsOnValue !== null) {
                    const condition = dependency.condition || 'eq';
                    const targetValue = dependency.value;
                    
                    let conditionMet = false;
                    
                    if (condition === 'eq' && dependsOnValue == targetValue) {
                      conditionMet = true;
                    } else if (condition === 'neq' && dependsOnValue != targetValue) {
                      conditionMet = true;
                    } else if (condition === 'gt' && Number(dependsOnValue) > Number(targetValue)) {
                      conditionMet = true;
                    } else if (condition === 'lt' && Number(dependsOnValue) < Number(targetValue)) {
                      conditionMet = true;
                    } else if (condition === 'gte' && Number(dependsOnValue) >= Number(targetValue)) {
                      conditionMet = true;
                    } else if (condition === 'lte' && Number(dependsOnValue) <= Number(targetValue)) {
                      conditionMet = true;
                    } else if (condition === 'contains' && dependsOnValue.includes(targetValue)) {
                      conditionMet = true;
                    }
                    
                    if (dependency.required && !conditionMet) {
                      newWarnings.push({
                        columnId: column.id,
                        message: `"${category.name}" kateqoriyasında "${column.name}" dəyəri "${dependsOnColumn.name}" sahəsindəki dəyərdən asılıdır`,
                        categoryId: category.id
                      });
                      
                      valueObj.warningMessage = t('dependencyWarning', { field: dependsOnColumn.name });
                    }
                  }
                }
              });
            }
          }
        });
      }
    });
    
    setErrors(newErrors);
    setWarnings(newWarnings);
    
    return newErrors.length === 0;
  }, [categories, entries, t]);
  
  const validateFormAndGetErrors = useCallback((): { valid: boolean; errors: ColumnValidationError[] } => {
    const isValid = validateForm();
    return {
      valid: isValid,
      errors: errors
    };
  }, [validateForm, errors]);
  
  return {
    errors,
    warnings,
    validateForm,
    validateFormAndGetErrors,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0
  };
};

export default useValidation;
