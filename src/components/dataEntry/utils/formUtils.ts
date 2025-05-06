
import { ValidationResult } from '@/types/dataEntry';

/**
 * Sahə validasiyasını həyata keçirir
 * @param value Sahə dəyəri
 * @param validationRules Validasiya qaydaları
 * @param fieldType Sahə tipi
 * @returns Validasiya nəticəsi {isValid, errorMessage}
 */
export const validateField = (
  value: string, 
  validationRules: any, 
  fieldType: string
): ValidationResult => {
  // Validasiya qaydaları yoxdursa, true qaytarırıq
  if (!validationRules) {
    return { isValid: true };
  }

  // Boş məlumat yoxlaması
  if (validationRules.required && (!value || value.trim() === '')) {
    return { 
      isValid: false, 
      errorMessage: 'Bu sahə məcburidir' 
    };
  }

  // Ədədi sahələr üçün
  if (fieldType === 'number' && value) {
    const numValue = parseFloat(value);
    
    // Ədədi format yoxlaması
    if (isNaN(numValue)) {
      return { 
        isValid: false, 
        errorMessage: 'Düzgün ədəd formatında deyil' 
      };
    }

    // Minimum dəyər yoxlaması
    if (validationRules.min !== undefined && numValue < validationRules.min) {
      return { 
        isValid: false, 
        errorMessage: `Minimum dəyər ${validationRules.min} olmalıdır` 
      };
    }

    // Maksimum dəyər yoxlaması
    if (validationRules.max !== undefined && numValue > validationRules.max) {
      return { 
        isValid: false, 
        errorMessage: `Maksimum dəyər ${validationRules.max} olmalıdır` 
      };
    }
  }

  // Mətn sahələri üçün
  if (fieldType === 'text' || fieldType === 'textarea') {
    // Minimum uzunluq yoxlaması
    if (validationRules.minLength && value.length < validationRules.minLength) {
      return { 
        isValid: false, 
        errorMessage: `Minimum ${validationRules.minLength} simvol olmalıdır` 
      };
    }

    // Maksimum uzunluq yoxlaması
    if (validationRules.maxLength && value.length > validationRules.maxLength) {
      return { 
        isValid: false, 
        errorMessage: `Maksimum ${validationRules.maxLength} simvol olmalıdır` 
      };
    }

    // Pattern yoxlaması
    if (validationRules.pattern && !new RegExp(validationRules.pattern).test(value)) {
      return { 
        isValid: false, 
        errorMessage: validationRules.patternMessage || 'Format düzgün deyil' 
      };
    }
  }

  // Email validasiyası
  if (fieldType === 'email' && value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return { 
        isValid: false, 
        errorMessage: 'Düzgün email formatı deyil' 
      };
    }
  }

  // Tarix validasiyası
  if (fieldType === 'date' && value) {
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) {
      return { 
        isValid: false, 
        errorMessage: 'Düzgün tarix formatı deyil' 
      };
    }
  }

  // Validasiyanı uğurla keçdikdə
  return { isValid: true };
};

/**
 * Sahə dəyərini formatlandırır
 * @param value Sahə dəyəri
 * @param fieldType Sahə tipi
 * @returns Formatlanmış dəyər
 */
export const formatValue = (value: string, fieldType: string): string => {
  if (!value) return value;

  switch (fieldType) {
    case 'number':
      // Rəqəmlər üçün formatlandırma (məsələn, minlik ayırıcı)
      return parseFloat(value).toLocaleString('az-AZ');
    
    case 'date':
      // Tarix formatı
      try {
        const date = new Date(value);
        return date.toLocaleDateString('az-AZ');
      } catch (err) {
        return value;
      }
      
    case 'text':
    case 'textarea':
    default:
      return value;
  }
};
