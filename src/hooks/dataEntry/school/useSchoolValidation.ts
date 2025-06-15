
import { ValidationRules } from '@/types/column';

export const useSchoolValidation = () => {
  const validateField = (value: any, rules: ValidationRules): string | null => {
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || value === '')) {
      return 'Bu sahə tələb olunur';
    }

    // Skip other validations if value is empty and not required
    if (!value || value === '') return null;

    // Min/Max validation for numbers
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < Number(rules.min)) {
        return `Minimum dəyər: ${rules.min}`;
      }
      if (rules.max !== undefined && value > Number(rules.max)) {
        return `Maksimum dəyər: ${rules.max}`;
      }
    }

    // String length validation
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum uzunluq: ${rules.minLength}`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Maksimum uzunluq: ${rules.maxLength}`;
      }
    }

    // Email validation
    if (rules.email && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Düzgün email formatı daxil edin';
      }
    }

    return null;
  };

  return {
    validateField
  };
};
