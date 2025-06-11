
import { useState, useCallback } from 'react';

export const useFormManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const validateForm = useCallback((data: Record<string, any>, rules: Record<string, any>) => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(rules).forEach(field => {
      const value = data[field];
      const rule = rules[field];
      
      if (rule.required && (!value || value === '')) {
        newErrors[field] = `${field} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  return {
    isLoading,
    errors,
    setIsLoading,
    clearErrors,
    setFieldError,
    validateForm
  };
};
