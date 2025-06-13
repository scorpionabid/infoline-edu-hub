
import { useState, useCallback } from 'react';

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ConnectionHealth {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  health: 'good' | 'poor' | 'offline';
  reconnectCount: number;
  lastError?: string;
}

export const useRealTimeValidation = () => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateField = useCallback((field: string, value: any): ValidationError | null => {
    // Basic validation logic
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return {
        field,
        message: 'Bu sahə tələb olunur',
        code: 'REQUIRED'
      };
    }
    return null;
  }, []);

  const validate = useCallback((data: Record<string, any>): ValidationResult => {
    const newErrors: ValidationError[] = [];
    
    Object.entries(data).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        newErrors.push(error);
      }
    });

    setErrors(newErrors);
    return {
      isValid: newErrors.length === 0,
      errors: newErrors
    };
  }, [validateField]);

  return {
    errors,
    validate,
    validateField,
    clearErrors: () => setErrors([])
  };
};
