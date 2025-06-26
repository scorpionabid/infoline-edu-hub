
import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const useValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((name: string, value: any, rules: ValidationRule): string | null => {
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${name} is required`;
    }

    if (value && rules.minLength && value.toString().length < rules.minLength) {
      return `${name} must be at least ${rules.minLength} characters`;
    }

    if (value && rules.maxLength && value.toString().length > rules.maxLength) {
      return `${name} must be no more than ${rules.maxLength} characters`;
    }

    if (value && rules.pattern && !rules.pattern.test(value.toString())) {
      return `${name} format is invalid`;
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, []);

  const validate = useCallback((data: any, rules: { [key: string]: ValidationRule }): boolean => {
    const newErrors: ValidationErrors = {};

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field], rules[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    validateField,
    // clearErrors
  };
};
