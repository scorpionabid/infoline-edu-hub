
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
                
                if (valueObj) {
                  valueObj.errorMessage = t('invalidFormat');
                }
              } else if (column.validation || column.validation) {
                const validationRules = ensureValidationRules(column.validation);
                if (validationRules?.minValue !== undefined && numValue < validationRules.minValue) {
                  newErrors.push({
                    columnId: column.id,
                    message: `"${category.name}" kateqoriyasında "${column.name}" minimum ${validationRules.minValue} olmalıdır`,
                    categoryId: category.id
                  });
                  
                  if (valueObj) {
                    valueObj.errorMessage = t('minValue');
                  }
                }
                
                if (validationRules?.maxValue !== undefined && numValue > validationRules.maxValue) {
                  newErrors.push({
                    columnId: column.id,
                    message: `"${category.name}" kateqoriyasında "${column.name}" maksimum ${validationRules.maxValue} olmalıdır`,
                    categoryId: category.id
                  });
                  
                  if (valueObj) {
                    valueObj.errorMessage = t('maxValue');
                  }
                }
                
                if (validationRules?.warningThreshold) {
                  const { min, max } = validationRules.warningThreshold;
                  
                  if ((min !== undefined && numValue < min) || (max !== undefined && numValue > max)) {
                    newWarnings.push({
                      columnId: column.id,
                      message: `"${category.name}" kateqoriyasında "${column.name}" qeyri-adi dəyərə malikdir. Zəhmət olmasa təkrar yoxlayın.`,
                      categoryId: category.id
                    });
                    
                    if (valueObj && !valueObj.errorMessage) {
                      valueObj.warningMessage = t('unusualValue');
                    }
                  }
                }
              }
            }
            
            else if (column.type === 'text' && column.validation) {
              const strValue = String(value);
              const validationRules = ensureValidationRules(column.validation);
              
              if (validationRules?.minLength !== undefined && strValue.length < validationRules.minLength) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" minimum ${validationRules.minLength} simvol olmalıdır`,
                  categoryId: category.id
                });
                
                if (valueObj) {
                  valueObj.errorMessage = t('minLength');
                }
              }
              
              if (validationRules?.maxLength !== undefined && strValue.length > validationRules.maxLength) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" maksimum ${validationRules.maxLength} simvol olmalıdır`,
                  categoryId: category.id
                });
                
                if (valueObj) {
                  valueObj.errorMessage = t('maxLength');
                }
              }
              
              if (validationRules?.pattern && !new RegExp(validationRules.pattern).test(strValue)) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" düzgün formatda deyil`,
                  categoryId: category.id
                });
                
                if (valueObj) {
                  valueObj.errorMessage = validationRules.patternError || t('invalidFormat');
                }
              }
            }
            
            else if (column.type === 'date' && column.validation) {
              const dateValue = new Date(value);
              const validationRules = ensureValidationRules(column.validation);
              
              if (isNaN(dateValue.getTime())) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" düzgün tarix formatında deyil`,
                  categoryId: category.id
                });
                
                if (valueObj) {
                  valueObj.errorMessage = t('invalidDate');
                }
              } else {
                if (validationRules?.minDate) {
                  const minDate = new Date(validationRules.minDate);
                  
                  if (dateValue < minDate) {
                    newErrors.push({
                      columnId: column.id,
                      message: `"${category.name}" kateqoriyasında "${column.name}" ${minDate.toLocaleDateString()}-dən sonra olmalıdır`,
                      categoryId: category.id
                    });
                    
                    if (valueObj) {
                      valueObj.errorMessage = t('minDate');
                    }
                  }
                }
                
                if (validationRules?.maxDate) {
                  const maxDate = new Date(validationRules.maxDate);
                  
                  if (dateValue > maxDate) {
                    newErrors.push({
                      columnId: column.id,
                      message: `"${category.name}" kateqoriyasında "${column.name}" ${maxDate.toLocaleDateString()}-dən əvvəl olmalıdır`,
                      categoryId: category.id
                    });
                    
                    if (valueObj) {
                      valueObj.errorMessage = t('maxDate');
                    }
                  }
                }
              }
            }
            
            else if (column.type === 'email') {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(String(value))) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" düzgün email formatında deyil`,
                  categoryId: category.id
                });
                
                if (valueObj) {
                  valueObj.errorMessage = t('invalidEmail');
                }
              }
            }
            
            else if (column.type === 'phone') {
              const phoneRegex = /^[\d\s\+\-\(\)]{7,15}$/;
              if (!phoneRegex.test(String(value))) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" düzgün telefon formatında deyil`,
                  categoryId: category.id
                });
                
                if (valueObj) {
                  valueObj.errorMessage = t('invalidPhone');
                }
              }
            }
          }
        });
        
        category.columns.forEach(column => {
          if (column.dependsOn) {
            // column.dependsOn tipini DependsOnCondition tipinə çeviririk
            const dependsOn = column.dependsOn as unknown as DependsOnCondition;
            const parentValueObj = categoryEntry.values.find((v: any) => v.columnId === dependsOn.columnId);
            const currentValueObj = categoryEntry.values.find((v: any) => v.columnId === column.id);
            
            if (parentValueObj && dependsOn.condition) {
              const parentValue = parentValueObj.value;
              let conditionMet = false;
              
              if (dependsOn.condition.type === 'equals' && parentValue === dependsOn.condition.value) {
                conditionMet = true;
              } else if (dependsOn.condition.type === 'notEquals' && parentValue !== dependsOn.condition.value) {
                conditionMet = true;
              } else if (dependsOn.condition.type === 'greaterThan' && Number(parentValue) > Number(dependsOn.condition.value)) {
                conditionMet = true;
              } else if (dependsOn.condition.type === 'lessThan' && Number(parentValue) < Number(dependsOn.condition.value)) {
                conditionMet = true;
              }
              
              if (conditionMet && column.is_required) {
                const value = currentValueObj?.value;
                
                if (value === undefined || value === null || value === '') {
                  newErrors.push({
                    columnId: column.id,
                    message: `"${category.name}" kateqoriyasında "${column.name}" doldurulmalıdır`,
                    categoryId: category.id
                  });
                  
                  if (currentValueObj) {
                    currentValueObj.errorMessage = t('fieldRequired');
                  }
                }
              }
            }
          }
        });
      }
    });
    
    setErrors(newErrors);
    setWarnings(newWarnings);
    return newErrors.length === 0;
  }, [categories, entries, t]);
  
  const ensureValidationRules = (validationRulesOrJson: ValidationRules | Json | undefined): ValidationRules | undefined => {
    if (!validationRulesOrJson) return undefined;
    
    if (typeof validationRulesOrJson === 'string') {
      try {
        return JSON.parse(validationRulesOrJson) as ValidationRules;
      } catch (e) {
        console.error('Invalid validation rules format:', e);
        return undefined;
      }
    }
    
    return validationRulesOrJson as ValidationRules;
  };
  
  const getErrorForColumn = useCallback((columnId: string) => {
    const error = errors.find(err => err.columnId === columnId);
    if (error) return error.message;
    
    return undefined;
  }, [errors]);
  
  const getWarningForColumn = useCallback((columnId: string) => {
    const warning = warnings.find(w => w.columnId === columnId);
    if (warning) return warning.message;
    
    return undefined;
  }, [warnings]);
  
  const getCategoryValidationStatus = useCallback((categoryId: string) => {
    const categoryErrors = errors.filter(error => error.categoryId === categoryId);
    const categoryWarnings = warnings.filter(warning => warning.categoryId === categoryId);
    
    return {
      hasErrors: categoryErrors.length > 0,
      hasWarnings: categoryWarnings.length > 0,
      errorCount: categoryErrors.length,
      warningCount: categoryWarnings.length
    };
  }, [errors, warnings]);
  
  return {
    errors,
    warnings,
    validateForm,
    getErrorForColumn,
    getWarningForColumn,
    getCategoryValidationStatus
  };
};
