import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { validateRequired, validateMinMax, ValidationResult } from './validationUtils';

// Kolonlar üçün tip tərifləri
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  status: 'active' | 'inactive';
  order_index?: number;
  validation?: any;
  options?: any;
  default_value?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  priority?: number;
  columns?: Column[];
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  dependsOn?: DependsOnCondition;
}

export interface DependsOnCondition {
  columnId: string;
  condition: 'equal' | 'not_equal' | 'in' | 'not_in';
  value: any;
  severity?: 'error' | 'warning';
  message?: string;
}

// Validation errors tip definisiyası
export interface ColumnValidationError {
  columnId: string;
  columnName: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

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
    
    // Bütün kategoriyaları nəzərdən keçirib sütunları validasiya edirik
    for (const category of categories) {
      if (!category.columns) continue;
      
      for (const column of category.columns) {
        // Uyğun dəyəri tapırıq
        const entry = entries.find(e => e.columnId === column.id);
        const value = entry ? entry.value : null;
        
        // Valid olub-olmadığını yoxlayırıq
        if (column.is_required && (value === null || value === undefined || value === '')) {
          newErrors.push({
            columnId: column.id,
            columnName: column.name,
            message: t('field_required', { field: column.name }),
            severity: 'error'
          });
          continue;
        }
        
        // Əgər dəyər boşdursa, digər qaydaları yoxlamarıq
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        // Əlavə validasiya qaydalarını yoxlayırıq
        const validationRules = column.validation as ValidationRules;
        if (validationRules) {
          // Asılılıqları yoxlayırıq
          if (validationRules.dependsOn) {
            const dependsOnResult = validateDependsOn(validationRules.dependsOn, column, entries, categories);
            if (!dependsOnResult.valid) {
              if (dependsOnResult.severity === 'error') {
                newErrors.push({
                  columnId: column.id,
                  columnName: column.name,
                  message: dependsOnResult.message || t('field_depends_on_error'),
                  severity: 'error'
                });
              } else {
                newWarnings.push({
                  columnId: column.id,
                  columnName: column.name,
                  message: dependsOnResult.message || t('field_depends_on_warning'),
                  severity: 'warning'
                });
              }
            }
          }
          
          // Min/max dəyərləri yoxlayırıq
          if ((validationRules.min !== undefined || validationRules.max !== undefined) && 
              !isNaN(Number(value))) {
            const numValue = Number(value);
            if (validationRules.min !== undefined && numValue < validationRules.min) {
              newErrors.push({
                columnId: column.id,
                columnName: column.name,
                message: t('field_min_value', { field: column.name, min: validationRules.min }),
                severity: 'error'
              });
            }
            if (validationRules.max !== undefined && numValue > validationRules.max) {
              newErrors.push({
                columnId: column.id,
                columnName: column.name,
                message: t('field_max_value', { field: column.name, max: validationRules.max }),
                severity: 'error'
              });
            }
          }
          
          // Minimum uzunluq validasiyası
          if (validationRules.minLength !== undefined && String(value).length < validationRules.minLength) {
            newErrors.push({
              columnId: column.id,
              columnName: column.name,
              message: t('field_min_length', { field: column.name, length: validationRules.minLength }),
              severity: 'error'
            });
          }
          
          // Maksimum uzunluq validasiyası
          if (validationRules.maxLength !== undefined && String(value).length > validationRules.maxLength) {
            newErrors.push({
              columnId: column.id,
              columnName: column.name,
              message: t('field_max_length', { field: column.name, length: validationRules.maxLength }),
              severity: 'error'
            });
          }
          
          // Pattern (regex) validasiyası
          if (validationRules.pattern && !new RegExp(validationRules.pattern).test(String(value))) {
            newErrors.push({
              columnId: column.id,
              columnName: column.name,
              message: validationRules.patternMessage || t('field_pattern_error', { field: column.name }),
              severity: 'error'
            });
          }
        }
      }
    }
    
    setErrors(newErrors);
    setWarnings(newWarnings);
    
    return newErrors.length === 0;
  }, [categories, entries, t]);
  
  // Asılılıq validasiyası
  const validateDependsOn = (
    dependsOn: DependsOnCondition,
    currentColumn: Column,
    allEntries: any[],
    allCategories: CategoryWithColumns[]
  ): { valid: boolean; severity: 'error' | 'warning'; message?: string } => {
    // Asılı olduğu sütunu tapırıq
    const dependentColumn = allCategories
      .flatMap(cat => cat.columns || [])
      .find(col => col.id === dependsOn.columnId);
    
    if (!dependentColumn) {
      return { valid: true, severity: 'error' };
    }
    
    // Asılı olduğu sütunun dəyərini tapırıq
    const dependentEntry = allEntries.find(e => e.columnId === dependsOn.columnId);
    const dependentValue = dependentEntry ? dependentEntry.value : null;
    
    // Əgər asılı olduğu sütun boşdursa, valid deyil
    if (dependentValue === null || dependentValue === undefined || dependentValue === '') {
      return { 
        valid: false, 
        severity: dependsOn.severity || 'error',
        message: t('field_depends_on_empty', { 
          field: currentColumn.name, 
          dependentField: dependentColumn.name 
        })
      };
    }
    
    // Əgər asılılıq şərti 'equal' isə
    if (dependsOn.condition === 'equal' && dependentValue != dependsOn.value) {
      return { 
        valid: false, 
        severity: dependsOn.severity || 'error',
        message: t('field_depends_on_equal', { 
          field: currentColumn.name, 
          dependentField: dependentColumn.name,
          value: dependsOn.value
        })
      };
    }
    
    // Əgər asılılıq şərti 'not_equal' isə
    if (dependsOn.condition === 'not_equal' && dependentValue == dependsOn.value) {
      return { 
        valid: false, 
        severity: dependsOn.severity || 'error',
        message: t('field_depends_on_not_equal', { 
          field: currentColumn.name, 
          dependentField: dependentColumn.name,
          value: dependsOn.value
        })
      };
    }
    
    // Əgər asılılıq şərti 'in' isə (massiv içində olmalıdır)
    if (dependsOn.condition === 'in' && Array.isArray(dependsOn.value) && 
        !dependsOn.value.includes(dependentValue)) {
      return { 
        valid: false, 
        severity: dependsOn.severity || 'error',
        message: t('field_depends_on_in', { 
          field: currentColumn.name, 
          dependentField: dependentColumn.name,
          values: Array.isArray(dependsOn.value) ? dependsOn.value.join(', ') : ''
        })
      };
    }
    
    // Əgər asılılıq şərti 'not_in' isə (massiv içində olmamadır)
    if (dependsOn.condition === 'not_in' && Array.isArray(dependsOn.value) && 
        dependsOn.value.includes(dependentValue)) {
      return { 
        valid: false, 
        severity: dependsOn.severity || 'error',
        message: t('field_depends_on_not_in', { 
          field: currentColumn.name, 
          dependentField: dependentColumn.name,
          values: Array.isArray(dependsOn.value) ? dependsOn.value.join(', ') : ''
        })
      };
    }
    
    return { valid: true, severity: 'error' };
  };
  
  return {
    validateForm,
    errors,
    warnings,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    isValid: errors.length === 0
  };

export default useValidation;
