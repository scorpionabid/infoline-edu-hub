
import { parse, isValid, isBefore, isAfter } from 'date-fns';

// Dəyər tipi
export type FormFieldValue = string;

// Validasiya funksiyası - string qəbul edib işləyir
export const validateField = (field: any, value: FormFieldValue): string | null => {
  if (!field) return null;

  // Məcburi sahə yoxlaması
  if (field.isRequired && (!value || value.trim() === '')) {
    return 'Bu sahə məcburidir';
  }

  if (!value) return null;

  const { validation = {} } = field;

  // Tip-spesifik validasiyalar
  switch (field.type) {
    case 'text':
    case 'textarea':
      // Minimum uzunluq
      if (validation.minLength && value.length < validation.minLength) {
        return `Minimum ${validation.minLength} simvol tələb olunur`;
      }

      // Maksimum uzunluq
      if (validation.maxLength && value.length > validation.maxLength) {
        return `Maksimum ${validation.maxLength} simvol icazə verilir`;
      }

      // Nümunə yoxlaması
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return validation.patternMessage || 'Düzgün format deyil';
      }
      break;

    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Düzgün rəqəm deyil';
      }

      // Minimum dəyər
      if (validation.min !== undefined && numValue < validation.min) {
        return `Minimum dəyər ${validation.min} olmalıdır`;
      }

      // Maksimum dəyər
      if (validation.max !== undefined && numValue > validation.max) {
        return `Maksimum dəyər ${validation.max} olmalıdır`;
      }
      break;

    case 'email':
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return 'Düzgün e-poçt ünvanı deyil';
      }
      break;

    case 'url':
      try {
        new URL(value);
      } catch (e) {
        return 'Düzgün URL deyil';
      }
      break;

    case 'phone':
      const phoneRegex = /^\+?[0-9\s-()]{7,15}$/;
      if (!phoneRegex.test(value)) {
        return 'Düzgün telefon nömrəsi deyil';
      }
      break;

    case 'date':
      const dateValue = new Date(value);
      if (!isValid(dateValue)) {
        return 'Düzgün tarix deyil';
      }

      // Minimum tarix
      if (validation.minDate) {
        const minDate = new Date(validation.minDate);
        if (isBefore(dateValue, minDate)) {
          return `Tarix ${minDate.toLocaleDateString()} tarixindən sonra olmalıdır`;
        }
      }

      // Maksimum tarix
      if (validation.maxDate) {
        const maxDate = new Date(validation.maxDate);
        if (isAfter(dateValue, maxDate)) {
          return `Tarix ${maxDate.toLocaleDateString()} tarixindən əvvəl olmalıdır`;
        }
      }
      break;
  }

  return null;
};

// Dəyəri formatla
export const formatValue = (field: any, value: FormFieldValue): string => {
  if (!field || !value) return '';

  switch (field.type) {
    case 'date':
      const date = new Date(value);
      return isValid(date) ? date.toLocaleDateString() : value;
    case 'checkbox':
      return value === 'true' ? 'Bəli' : 'Xeyr';
    default:
      return value;
  }
};

// Bütün sahələri validasiya et
export const validateAllFields = (
  fields: any[], 
  values: Record<string, FormFieldValue>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const error = validateField(field, values[field.id]);
    if (error) {
      errors[field.id] = error;
    }
  });

  return errors;
};
