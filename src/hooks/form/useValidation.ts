
import { useState, useCallback } from 'react';
import { ValidationRules } from '@/types/validation';

export interface ValidationState {
  errors: Record<string, string[]>;
  isValid: boolean;
}

export function useValidation() {
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    isValid: true
  });

  const validateField = useCallback((value: any, rules: ValidationRules): string[] => {
    const errors: string[] = [];

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push('Bu sahə məcburidir');
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Minimum ${rules.minLength} simvol olmalıdır`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Maksimum ${rules.maxLength} simvol olmalıdır`);
    }

    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      errors.push(rules.message || 'Düzgün format deyil');
    }

    if (rules.min && Number(value) < rules.min) {
      errors.push(`Minimum dəyər ${rules.min} olmalıdır`);
    }

    if (rules.max && Number(value) > rules.max) {
      errors.push(`Maksimum dəyər ${rules.max} olmalıdır`);
    }

    return errors;
  }, []);

  const validate = useCallback((values: Record<string, any>, rules: Record<string, ValidationRules>): boolean => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    Object.keys(rules).forEach((field) => {
      const fieldErrors = validateField(values[field], rules[field]);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
        isValid = false;
      }
    });

    setValidationState({ errors, isValid });
    return isValid;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setValidationState({ errors: {}, isValid: true });
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setValidationState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return { errors: newErrors, isValid: Object.keys(newErrors).length === 0 };
    });
  }, []);

  return {
    ...validationState,
    validate,
    validateField,
    clearErrors,
    clearFieldError
  };
}
