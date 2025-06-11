import { useState, useEffect, useCallback, useMemo } from 'react';
import { Column } from '@/types/column';
import { useDebounce } from '@/hooks/useDebounce';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'email' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean | Promise<boolean>;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface FieldValidationState {
  isValidating: boolean;
  isTouched: boolean;
  result: ValidationResult;
}

export interface UseRealTimeValidationConfig {
  columns: Column[];
  formData: Record<string, any>;
  enabled?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  customValidators?: Record<string, (value: any) => ValidationResult | Promise<ValidationResult>>;
}

export interface UseRealTimeValidationResult {
  // Validation state
  validationState: Record<string, FieldValidationState>;
  isValid: boolean;
  hasErrors: boolean;
  completionPercentage: number;
  
  // Field-specific methods
  getFieldError: (fieldId: string) => string | undefined;
  getFieldWarning: (fieldId: string) => string | undefined;
  isFieldValidating: (fieldId: string) => boolean;
  isFieldTouched: (fieldId: string) => boolean;
  markFieldAsTouched: (fieldId: string) => void;
  validateField: (fieldId: string, value: any) => Promise<ValidationResult>;
  
  // Form-level methods
  validateAll: () => Promise<boolean>;
  clearValidation: (fieldId?: string) => void;
  resetValidation: () => void;
  
  // Validation rules
  getValidationRules: (column: Column) => ValidationRule[];
}

/**
 * Təkmilləşdirilmiş Real-Time Validation Hook
 * 
 * Bu hook aşağıdakı funksiyaları təmin edir:
 * - Real-time field validation
 * - Column validation rules support
 * - Async validation support
 * - Custom validation rules
 * - User-friendly error messages
 * - Performance optimizations
 */
export const useRealTimeValidation = ({
  columns,
  formData,
  enabled = true,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 300,
  customValidators = {}
}: UseRealTimeValidationConfig): UseRealTimeValidationResult => {
  
  const [validationState, setValidationState] = useState<Record<string, FieldValidationState>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  // Debounced form data
  const debouncedFormData = useDebounce(formData, debounceMs);
  
  // Create validation rules for a column
  const getValidationRules = useCallback((column: Column): ValidationRule[] => {
    const rules: ValidationRule[] = [];
    
    // Required validation
    if (column.is_required) {
      rules.push({
        type: 'required',
        message: `${column.name} sahəsi məcburidir`
      });
    }
    
    // Type-based validation
    switch (column.type) {
      case 'number':
        rules.push({
          type: 'custom',
          message: `${column.name} sahəsi rəqəm olmalıdır`,
          validator: (value) => {
            if (!value) return true; // Empty is handled by required
            return !isNaN(Number(value)) && isFinite(Number(value));
          }
        });
        
        // Min/Max validation from column.validation
        if (column.validation) {
          const validation = typeof column.validation === 'string' 
            ? JSON.parse(column.validation) 
            : column.validation;
            
          if (validation.min !== undefined) {
            rules.push({
              type: 'min',
              value: validation.min,
              message: `${column.name} sahəsi minimum ${validation.min} olmalıdır`
            });
          }
          
          if (validation.max !== undefined) {
            rules.push({
              type: 'max',
              value: validation.max,
              message: `${column.name} sahəsi maksimum ${validation.max} olmalıdır`
            });
          }
        }
        break;
        
      case 'email':
        rules.push({
          type: 'email',
          message: `${column.name} sahəsində düzgün e-poçt ünvanı daxil edin`,
          validator: (value) => {
            if (!value) return true;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
          }
        });
        break;
        
      case 'date':
        rules.push({
          type: 'custom',
          message: `${column.name} sahəsində keçərli tarix daxil edin`,
          validator: (value) => {
            if (!value) return true;
            const date = new Date(value);
            return !isNaN(date.getTime());
          }
        });
        break;
        
      case 'text':
        if (column.validation) {
          const validation = typeof column.validation === 'string' 
            ? JSON.parse(column.validation) 
            : column.validation;
            
          if (validation.minLength) {
            rules.push({
              type: 'minLength',
              value: validation.minLength,
              message: `${column.name} sahəsi minimum ${validation.minLength} simvol olmalıdır`
            });
          }
          
          if (validation.maxLength) {
            rules.push({
              type: 'maxLength',
              value: validation.maxLength,
              message: `${column.name} sahəsi maksimum ${validation.maxLength} simvol olmalıdır`
            });
          }
          
          if (validation.pattern) {
            rules.push({
              type: 'pattern',
              value: validation.pattern,
              message: validation.patternMessage || `${column.name} sahəsində düzgün format daxil edin`,
              validator: (value) => {
                if (!value) return true;
                const regex = new RegExp(validation.pattern);
                return regex.test(value);
              }
            });
          }
        }
        break;
    }
    
    return rules;
  }, []);
  
  // Validate a single field
  const validateField = useCallback(async (fieldId: string, value: any): Promise<ValidationResult> => {
    if (!enabled) {
      return { isValid: true };
    }
    
    const column = columns.find(col => col.id === fieldId);
    if (!column) {
      return { isValid: true };
    }
    
    const rules = getValidationRules(column);
    
    // Custom validator check first
    if (customValidators[fieldId]) {
      try {
        const customResult = await customValidators[fieldId](value);
        if (!customResult.isValid) {
          return customResult;
        }
      } catch (error) {
        console.error(`Custom validation error for ${fieldId}:`, error);
        return {
          isValid: false,
          error: 'Validasiya xətası baş verdi'
        };
      }
    }
    
    // Apply built-in rules
    for (const rule of rules) {
      let isValid = true;
      
      switch (rule.type) {
        case 'required':
          isValid = value !== undefined && value !== null && String(value).trim() !== '';
          break;
          
        case 'minLength':
          isValid = !value || String(value).length >= rule.value;
          break;
          
        case 'maxLength':
          isValid = !value || String(value).length <= rule.value;
          break;
          
        case 'min':
          isValid = !value || Number(value) >= rule.value;
          break;
          
        case 'max':
          isValid = !value || Number(value) <= rule.value;
          break;
          
        case 'custom':
        case 'email':
        case 'pattern':
          if (rule.validator) {
            try {
              isValid = await rule.validator(value);
            } catch (error) {
              isValid = false;
            }
          }
          break;
      }
      
      if (!isValid) {
        return {
          isValid: false,
          error: rule.message
        };
      }
    }
    
    return { isValid: true };
  }, [enabled, columns, getValidationRules, customValidators]);
  
  // Mark field as touched
  const markFieldAsTouched = useCallback((fieldId: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldId));
  }, []);
  
  // Validate all fields
  const validateAll = useCallback(async (): Promise<boolean> => {
    if (!enabled) return true;
    
    const validationPromises = columns.map(async (column) => {
      const value = formData[column.id];
      const result = await validateField(column.id, value);
      
      setValidationState(prev => ({
        ...prev,
        [column.id]: {
          isValidating: false,
          isTouched: true,
          result
        }
      }));
      
      return result.isValid;
    });
    
    const results = await Promise.all(validationPromises);
    const allValid = results.every(Boolean);
    
    // Mark all fields as touched
    setTouchedFields(new Set(columns.map(col => col.id)));
    
    return allValid;
  }, [enabled, columns, formData, validateField]);
  
  // Clear validation for specific field or all
  const clearValidation = useCallback((fieldId?: string) => {
    if (fieldId) {
      setValidationState(prev => {
        const newState = { ...prev };
        delete newState[fieldId];
        return newState;
      });
      setTouchedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
    } else {
      setValidationState({});
      setTouchedFields(new Set());
    }
  }, []);
  
  // Reset validation state
  const resetValidation = useCallback(() => {
    setValidationState({});
    setTouchedFields(new Set());
  }, []);
  
  // Real-time validation effect
  useEffect(() => {
    if (!enabled || !validateOnChange) return;
    
    const validateChangedFields = async () => {
      const fieldsToValidate = touchedFields.size > 0 
        ? Array.from(touchedFields)
        : columns.map(col => col.id);
      
      for (const fieldId of fieldsToValidate) {
        const value = debouncedFormData[fieldId];
        
        // Set validating state
        setValidationState(prev => ({
          ...prev,
          [fieldId]: {
            ...prev[fieldId],
            isValidating: true,
            isTouched: touchedFields.has(fieldId)
          }
        }));
        
        // Perform validation
        try {
          const result = await validateField(fieldId, value);
          
          setValidationState(prev => ({
            ...prev,
            [fieldId]: {
              isValidating: false,
              isTouched: touchedFields.has(fieldId),
              result
            }
          }));
        } catch (error) {
          console.error(`Validation error for field ${fieldId}:`, error);
          
          setValidationState(prev => ({
            ...prev,
            [fieldId]: {
              isValidating: false,
              isTouched: touchedFields.has(fieldId),
              result: {
                isValid: false,
                error: 'Validasiya xətası'
              }
            }
          }));
        }
      }
    };
    
    validateChangedFields();
  }, [debouncedFormData, enabled, validateOnChange, touchedFields, columns, validateField]);
  
  // Computed values
  const isValid = useMemo(() => {
    if (!enabled) return true;
    
    return Object.values(validationState).every(state => 
      !state.isTouched || state.result.isValid
    );
  }, [enabled, validationState]);
  
  const hasErrors = useMemo(() => {
    return Object.values(validationState).some(state => 
      state.isTouched && !state.result.isValid
    );
  }, [validationState]);
  
  const completionPercentage = useMemo(() => {
    if (columns.length === 0) return 0;
    
    const filledFields = columns.filter(column => {
      const value = formData[column.id];
      return value !== undefined && value !== null && String(value).trim() !== '';
    }).length;
    
    return Math.round((filledFields / columns.length) * 100);
  }, [columns, formData]);
  
  // Helper methods
  const getFieldError = useCallback((fieldId: string): string | undefined => {
    const state = validationState[fieldId];
    return state?.isTouched && !state.result.isValid ? state.result.error : undefined;
  }, [validationState]);
  
  const getFieldWarning = useCallback((fieldId: string): string | undefined => {
    const state = validationState[fieldId];
    return state?.isTouched ? state.result.warning : undefined;
  }, [validationState]);
  
  const isFieldValidating = useCallback((fieldId: string): boolean => {
    return validationState[fieldId]?.isValidating || false;
  }, [validationState]);
  
  const isFieldTouched = useCallback((fieldId: string): boolean => {
    return touchedFields.has(fieldId);
  }, [touchedFields]);
  
  return {
    // Validation state
    validationState,
    isValid,
    hasErrors,
    completionPercentage,
    
    // Field-specific methods
    getFieldError,
    getFieldWarning,
    isFieldValidating,
    isFieldTouched,
    markFieldAsTouched,
    validateField,
    
    // Form-level methods
    validateAll,
    clearValidation,
    resetValidation,
    
    // Validation rules
    getValidationRules
  };
};