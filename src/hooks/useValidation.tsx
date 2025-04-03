// ValidationRules tipində options dəyişdirək
import { useCallback } from 'react';
import { Column, ColumnValidation } from '@/types/column';
import { ValidationRules } from '@/types/dataEntry';
import { Json } from '@/types/supabase';

export const useValidation = () => {
  // Validasiya qaydalarını uyğunlaşdırmaq üçün köməkçi funksiya
  const adaptValidationRules = useCallback((columnValidation: ColumnValidation): ValidationRules => {
    // Əgər ColumnOption tipində options varsa, dəyərlərini string[] şəklində qaytaraq
    const options = Array.isArray(columnValidation.options)
      ? columnValidation.options.map(opt => 
          typeof opt === 'string' ? opt : opt.value
        )
      : undefined;
      
    return {
      required: columnValidation.required,
      minLength: columnValidation.minLength,
      maxLength: columnValidation.maxLength,
      min: columnValidation.min,
      max: columnValidation.max,
      pattern: columnValidation.pattern,
      patternMessage: columnValidation.patternMessage,
      options: options,
      minValue: columnValidation.min,
      maxValue: columnValidation.max,
      warningThreshold: columnValidation.warningThreshold,
      minDate: columnValidation.minDate,
      maxDate: columnValidation.maxDate
    };
  }, []);

  // Əsas validasiya funksiyası
  const validate = useCallback((column: Column, value: string) => {
    const validationRules = adaptValidationRules(column.validation || {});
    const errors: string[] = [];

    if (validationRules.required && !value) {
      errors.push('Bu sahə doldurulmalıdır.');
    }

    if (validationRules.minLength && value.length < validationRules.minLength) {
      errors.push(`Minimum ${validationRules.minLength} simvol olmalıdır.`);
    }

    if (validationRules.maxLength && value.length > validationRules.maxLength) {
      errors.push(`Maksimum ${validationRules.maxLength} simvol ola bilər.`);
    }

    if (validationRules.pattern && !new RegExp(validationRules.pattern).test(value)) {
      errors.push(validationRules.patternMessage || 'Yanlış format.');
    }

    if (column.type === 'number') {
      const numValue = Number(value);
      if (validationRules.min !== undefined && numValue < validationRules.min) {
        errors.push(`Minimum ${validationRules.min} ola bilər.`);
      }
      if (validationRules.max !== undefined && numValue > validationRules.max) {
        errors.push(`Maksimum ${validationRules.max} ola bilər.`);
      }
    }
    
    if (column.type === 'date') {
      const dateValue = new Date(value);
      if (validationRules.minDate && dateValue < new Date(validationRules.minDate)) {
        errors.push(`Minimum tarix ${new Date(validationRules.minDate).toLocaleDateString()} ola bilər.`);
      }
      if (validationRules.maxDate && dateValue > new Date(validationRules.maxDate)) {
        errors.push(`Maksimum tarix ${new Date(validationRules.maxDate).toLocaleDateString()} ola bilər.`);
      }
    }

    return errors;
  }, [adaptValidationRules]);

  // Xəbərdarlıqları yoxlamaq üçün funksiya
  const checkWarning = useCallback((column: Column, value: string) => {
    const validationRules = adaptValidationRules(column.validation || {});
    if (column.type === 'number' && validationRules.warningThreshold) {
      const numValue = Number(value);
      if (validationRules.warningThreshold.min !== undefined && numValue < validationRules.warningThreshold.min) {
        return `Dəyər minimum həddən aşağıdır.`;
      }
      if (validationRules.warningThreshold.max !== undefined && numValue > validationRules.warningThreshold.max) {
        return `Dəyər maksimum həddən yuxarıdır.`;
      }
    }
    return undefined;
  }, [adaptValidationRules]);

  return { validate, checkWarning };
};

export default useValidation;
