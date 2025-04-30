
import { ColumnType, ColumnValidation, ColumnValidationError } from '@/types/column';

export const validateField = (value: any, type: ColumnType, validation?: ColumnValidation): { isValid: boolean; message?: string } => {
  if (!validation) return { isValid: true };

  // Boş dəyər üçün yoxlama
  if (validation.required && (!value || value === '')) {
    return {
      isValid: false,
      message: validation.requiredMessage || 'Bu sahə tələb olunur'
    };
  }

  // Tipin spesifik yoxlamaları
  switch (type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
    case 'password':
      if (value && validation.minLength && String(value).length < validation.minLength) {
        return {
          isValid: false,
          message: `Minimum ${validation.minLength} simvol tələb olunur`
        };
      }
      if (value && validation.maxLength && String(value).length > validation.maxLength) {
        return {
          isValid: false,
          message: `Maksimum ${validation.maxLength} simvol ola bilər`
        };
      }
      if (value && validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(String(value))) {
          return {
            isValid: false,
            message: validation.patternMessage || 'Düzgün format daxil edin'
          };
        }
      }
      // Email validasiyası
      if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return {
            isValid: false,
            message: 'Düzgün email ünvanı daxil edin'
          };
        }
      }
      // URL validasiyası
      if (type === 'url' && value) {
        let url;
        try {
          url = new URL(String(value));
        } catch (_) {
          return {
            isValid: false,
            message: 'Düzgün URL daxil edin'
          };
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return {
            isValid: false,
            message: 'URL http:// və ya https:// ilə başlamalıdır'
          };
        }
      }
      break;
    
    case 'number':
      if (value === '') return { isValid: true };
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return {
          isValid: false,
          message: 'Etibarlı rəqəm daxil edin'
        };
      }
      if (validation.minValue !== undefined && numValue < validation.minValue) {
        return {
          isValid: false,
          message: `Minimum dəyər ${validation.minValue} olmalıdır`
        };
      }
      if (validation.maxValue !== undefined && numValue > validation.maxValue) {
        return {
          isValid: false,
          message: `Maksimum dəyər ${validation.maxValue} olmalıdır`
        };
      }
      break;
    
    case 'date':
      if (value === '') return { isValid: true };
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        return {
          isValid: false,
          message: 'Etibarlı tarix daxil edin'
        };
      }
      if (validation.minValue) {
        const minDate = new Date(validation.minValue);
        if (dateValue < minDate) {
          return {
            isValid: false,
            message: `Tarix ${minDate.toLocaleDateString()} tarixindən sonra olmalıdır`
          };
        }
      }
      if (validation.maxValue) {
        const maxDate = new Date(validation.maxValue);
        if (dateValue > maxDate) {
          return {
            isValid: false,
            message: `Tarix ${maxDate.toLocaleDateString()} tarixindən əvvəl olmalıdır`
          };
        }
      }
      break;
    
    case 'checkbox':
      if (validation.required && (!value || (Array.isArray(value) && value.length === 0))) {
        return {
          isValid: false,
          message: 'Ən azı bir seçim edin'
        };
      }
      break;
  }

  return { isValid: true };
};

export const validateEntryValue = (value: string, type: ColumnType, validation?: ColumnValidation): ColumnValidationError | null => {
  const result = validateField(value, type, validation);
  if (!result.isValid && result.message) {
    return {
      message: result.message,
      type: 'validation'
    };
  }
  return null;
};
