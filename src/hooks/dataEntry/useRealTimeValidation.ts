
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Column } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

export interface ValidationError {
  columnId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface UseRealTimeValidationProps {
  columns: Column[];
  formData: Record<string, any>;
  enabled?: boolean;
}

/**
 * Real-time validasiya hook-u
 * Forma sahələrini real vaxtda yoxlayır və xətaları göstərir
 */
export function useRealTimeValidation({
  columns,
  formData,
  enabled = true
}: UseRealTimeValidationProps) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  
  // Validasiya funksiyası
  const validateField = useCallback((column: Column, value: any): ValidationError[] => {
    const fieldErrors: ValidationError[] = [];
    
    if (!enabled) return fieldErrors;
    
    // Tələb olunan sahələri yoxla
    if (column.is_required && (!value || String(value).trim() === '')) {
      fieldErrors.push({
        columnId: column.id,
        message: t('fieldRequired', { field: column.name }),
        severity: 'error'
      });
      return fieldErrors;
    }
    
    // Əgər dəyər boşdursa, digər yoxlamaları keç
    if (!value || String(value).trim() === '') {
      return fieldErrors;
    }
    
    // Tip əsaslı validasiya
    switch (column.type) {
      case 'number':
        if (isNaN(Number(value))) {
          fieldErrors.push({
            columnId: column.id,
            message: t('fieldMustBeNumber', { field: column.name }),
            severity: 'error'
          });
        } else {
          const numValue = Number(value);
          
          // Min/max yoxlamaları
          if (column.validation) {
            const validation = column.validation as any;
            
            if (validation.min !== undefined && numValue < validation.min) {
              fieldErrors.push({
                columnId: column.id,
                message: t('fieldMinValue', { field: column.name, min: validation.min }),
                severity: 'error'
              });
            }
            
            if (validation.max !== undefined && numValue > validation.max) {
              fieldErrors.push({
                columnId: column.id,
                message: t('fieldMaxValue', { field: column.name, max: validation.max }),
                severity: 'error'
              });
            }
            
            // Xəbərdarlıq həddləri
            if (validation.warnAbove !== undefined && numValue > validation.warnAbove) {
              fieldErrors.push({
                columnId: column.id,
                message: t('fieldValueHigh', { field: column.name, threshold: validation.warnAbove }),
                severity: 'warning'
              });
            }
            
            if (validation.warnBelow !== undefined && numValue < validation.warnBelow) {
              fieldErrors.push({
                columnId: column.id,
                message: t('fieldValueLow', { field: column.name, threshold: validation.warnBelow }),
                severity: 'warning'
              });
            }
          }
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          fieldErrors.push({
            columnId: column.id,
            message: t('fieldInvalidEmail', { field: column.name }),
            severity: 'error'
          });
        }
        break;
        
      case 'phone':
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(String(value))) {
          fieldErrors.push({
            columnId: column.id,
            message: t('fieldInvalidPhone', { field: column.name }),
            severity: 'error'
          });
        }
        break;
        
      case 'url':
        try {
          new URL(String(value));
        } catch {
          fieldErrors.push({
            columnId: column.id,
            message: t('fieldInvalidUrl', { field: column.name }),
            severity: 'error'
          });
        }
        break;
    }
    
    // Uzunluq yoxlamaları
    if (column.validation) {
      const validation = column.validation as any;
      const strValue = String(value);
      
      if (validation.minLength !== undefined && strValue.length < validation.minLength) {
        fieldErrors.push({
          columnId: column.id,
          message: t('fieldMinLength', { field: column.name, length: validation.minLength }),
          severity: 'error'
        });
      }
      
      if (validation.maxLength !== undefined && strValue.length > validation.maxLength) {
        fieldErrors.push({
          columnId: column.id,
          message: t('fieldMaxLength', { field: column.name, length: validation.maxLength }),
          severity: 'error'
        });
      }
      
      // Pattern (regex) yoxlaması
      if (validation.pattern && !new RegExp(validation.pattern).test(strValue)) {
        fieldErrors.push({
          columnId: column.id,
          message: validation.patternMessage || t('fieldPatternError', { field: column.name }),
          severity: 'error'
        });
      }
    }
    
    return fieldErrors;
  }, [enabled, t]);
  
  // Bütün sahələri validasiya et
  const validateAllFields = useCallback(() => {
    if (!enabled) {
      setErrors([]);
      setWarnings([]);
      return;
    }
    
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    
    columns.forEach(column => {
      const value = formData[column.id];
      const fieldErrors = validateField(column, value);
      
      fieldErrors.forEach(error => {
        if (error.severity === 'error') {
          allErrors.push(error);
        } else if (error.severity === 'warning') {
          allWarnings.push(error);
        }
      });
    });
    
    setErrors(allErrors);
    setWarnings(allWarnings);
  }, [enabled, columns, formData, validateField]);
  
  // Form məlumatları dəyişdikdə validasiya et
  useEffect(() => {
    validateAllFields();
  }, [validateAllFields]);
  
  // Spesifik sahə üçün xəta al
  const getFieldError = useCallback((columnId: string): ValidationError | undefined => {
    return errors.find(error => error.columnId === columnId);
  }, [errors]);
  
  // Spesifik sahə üçün xəbərdarlıq al
  const getFieldWarning = useCallback((columnId: string): ValidationError | undefined => {
    return warnings.find(warning => warning.columnId === columnId);
  }, [warnings]);
  
  // Forma etibarlıdır?
  const isValid = useMemo(() => {
    return errors.length === 0;
  }, [errors]);
  
  // Tələb olunan sahələr doldurulub?
  const hasAllRequiredFields = useMemo(() => {
    const requiredColumns = columns.filter(col => col.is_required);
    return requiredColumns.every(col => {
      const value = formData[col.id];
      return value && String(value).trim() !== '';
    });
  }, [columns, formData]);
  
  return {
    errors,
    warnings,
    isValid,
    hasAllRequiredFields,
    getFieldError,
    getFieldWarning,
    validateField,
    validateAllFields
  };
}

export default useRealTimeValidation;
