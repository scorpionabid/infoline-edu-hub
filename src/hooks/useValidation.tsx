
import { useState, useCallback, useEffect } from 'react';
import { ColumnValidationError } from '@/types/dataEntry';
import { CategoryWithColumns, Column } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

// DependsOn tipi üçün interfeys
interface DependsOnCondition {
  columnId: string;
  condition: {
    type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
    value: any;
  };
}

export const useValidation = (categories: CategoryWithColumns[], entries: any[]) => {
  const [errors, setErrors] = useState<ColumnValidationError[]>([]);
  const [warnings, setWarnings] = useState<ColumnValidationError[]>([]);
  const { t } = useLanguage();
  
  // İlkin yüklənmə zamanı və ya entries dəyişdikdə validasiya etmək
  useEffect(() => {
    if (categories.length > 0 && entries.length > 0) {
      validateForm();
    }
  }, [categories, entries]);
  
  // Formanı validasiya etmək - genişləndirilmiş
  const validateForm = useCallback((): boolean => {
    const newErrors: ColumnValidationError[] = [];
    const newWarnings: ColumnValidationError[] = [];
    
    categories.forEach(category => {
      const categoryEntry = entries.find(entry => entry.categoryId === category.id);
      
      if (categoryEntry) {
        category.columns.forEach(column => {
          // Məcburi sahələrin validasiyası
          if (column.isRequired) {
            const valueObj = categoryEntry.values.find((v: any) => v.columnId === column.id);
            const value = valueObj?.value;
            
            if (value === undefined || value === null || value === '') {
              newErrors.push({
                columnId: column.id,
                message: `"${category.name}" kateqoriyasında "${column.name}" doldurulmalıdır`,
                categoryId: category.id
              });
              
              // Value obyektinə error mesajı əlavə edək
              if (valueObj) {
                valueObj.errorMessage = t('fieldRequired');
              }
            }
          }
          
          // Dəyər varsa, tipinə görə validasiya edək
          const valueObj = categoryEntry.values.find((v: any) => v.columnId === column.id);
          
          if (valueObj && valueObj.value !== undefined && valueObj.value !== null && valueObj.value !== '') {
            const value = valueObj.value;
            
            // Rəqəm tipli sahələr üçün validasiya
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
              } else if (column.validation || column.validationRules) {
                const validationRules = column.validation || column.validationRules;
                // Min/max validasiyaları
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
                
                // Xəbərdarlıq: Qeyri-adi dəyər (error deyil)
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
            
            // Mətn tipli sahələr üçün validasiya
            else if (column.type === 'text' && (column.validation || column.validationRules)) {
              const strValue = String(value);
              const validationRules = column.validation || column.validationRules;
              
              // Minimal uzunluq
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
              
              // Maksimal uzunluq
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
              
              // Regex validasiyası
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
            
            // Tarix tipli sahələr üçün validasiya
            else if (column.type === 'date' && (column.validation || column.validationRules)) {
              const dateValue = new Date(value);
              const validationRules = column.validation || column.validationRules;
              
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
                // Minimum tarix validasiyası
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
                
                // Maksimum tarix validasiyası
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
            
            // Email sahəsi üçün validasiya
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
            
            // Telefon sahəsi üçün validasiya
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
        
        // Asılı sahələrin validasiyası
        category.columns.forEach(column => {
          if (column.dependsOn) {
            const dependsOn = column.dependsOn as DependsOnCondition;
            const parentValueObj = categoryEntry.values.find((v: any) => v.columnId === dependsOn.columnId);
            const currentValueObj = categoryEntry.values.find((v: any) => v.columnId === column.id);
            
            if (parentValueObj && dependsOn.condition) {
              const parentValue = parentValueObj.value;
              let conditionMet = false;
              
              // Şərt tipindən asılı olaraq yoxlama
              if (dependsOn.condition.type === 'equals' && parentValue === dependsOn.condition.value) {
                conditionMet = true;
              } else if (dependsOn.condition.type === 'notEquals' && parentValue !== dependsOn.condition.value) {
                conditionMet = true;
              } else if (dependsOn.condition.type === 'greaterThan' && Number(parentValue) > Number(dependsOn.condition.value)) {
                conditionMet = true;
              } else if (dependsOn.condition.type === 'lessThan' && Number(parentValue) < Number(dependsOn.condition.value)) {
                conditionMet = true;
              }
              
              // Əgər şərt ödənilibsə və sahə məcburidirsə, doldurulub-doldurulmadığını yoxlayaq
              if (conditionMet && column.isRequired) {
                const value = currentValueObj?.value;
                
                if (value === undefined || value === null || value === '') {
                  newErrors.push({
                    columnId: column.id,
                    message: `"${category.name}" kateqoriyasında "${column.name}" doldurulmalıdır`,
                    categoryId: category.id
                  });
                  
                  // Value obyektinə error mesajı əlavə edək
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
  
  // Sütun üçün xəta mesajını almaq
  const getErrorForColumn = useCallback((columnId: string) => {
    const error = errors.find(err => err.columnId === columnId);
    if (error) return error.message;
    
    return undefined;
  }, [errors]);
  
  // Sütun üçün xəbərdarlıq mesajını almaq
  const getWarningForColumn = useCallback((columnId: string) => {
    const warning = warnings.find(w => w.columnId === columnId);
    if (warning) return warning.message;
    
    return undefined;
  }, [warnings]);
  
  // Kateqoriyanın validasiya statusunu almaq
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
