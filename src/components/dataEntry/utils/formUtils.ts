
import { ColumnType, Column, ColumnValidation, ColumnValidationError } from '@/types/column';
import { DataEntryStatus } from '@/types/dataEntry';
import { EntryValue } from '@/types/dataEntry';

/**
 * Giriş məlumatını sütun tipinə və validasiya qaydalarına görə doğrulayır
 * @param value Dəyər
 * @param type Sütun tipi
 * @param validation Validasiya qaydaları 
 */
export const validateEntryValue = (
  value: string,
  type: ColumnType,
  validation?: ColumnValidation
): string | null => {
  // Validasiya qaydaları yoxdursa, keçərli
  if (!validation) return null;

  // Tələb olunan sahə yoxlaması
  if (validation.required && (!value || value.trim() === '')) {
    return validation.requiredMessage || 'Bu sahə tələb olunur';
  }

  // Boş dəyər və məcburi deyilsə, keçərli
  if (!validation.required && (!value || value.trim() === '')) {
    return null;
  }

  // Tip-əsaslı validasiyalar
  switch (type) {
    case 'text':
    case 'textarea':
      return validateText(value, validation);
    case 'number':
      return validateNumber(value, validation);
    case 'select':
      return validateSelect(value, validation);
    case 'date':
      return validateDate(value, validation);
    case 'checkbox':
      return null; // Checkbox xüsusi validasiya tələb etmir
    case 'radio':
      return validateRadio(value, validation);
    default:
      return null;
  }
};

/**
 * Mətn dəyərini validasiya edir
 */
const validateText = (value: string, validation: ColumnValidation): string | null => {
  // Regex pattern yoxlaması
  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      return validation.patternMessage || 'Dəyər düzgün formatda deyil';
    }
  }

  // Email formatı yoxlaması
  if (validation.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Düzgün email formatı daxil edin';
    }
  }

  // URL formatı yoxlaması
  if (validation.url) {
    try {
      new URL(value);
    } catch (e) {
      return 'Düzgün URL formatı daxil edin';
    }
  }

  // Siyahıda olma yoxlaması
  if (validation.inclusion && Array.isArray(validation.inclusion)) {
    if (!validation.inclusion.includes(value)) {
      return `Dəyər bu siyahıdan olmalıdır: ${validation.inclusion.join(', ')}`;
    }
  }

  // Minimum uzunluq yoxlaması
  if (validation.minLength !== undefined && value.length < validation.minLength) {
    return `Ən azı ${validation.minLength} simvol olmalıdır`;
  }

  // Maksimum uzunluq yoxlaması
  if (validation.maxLength !== undefined && value.length > parseInt(validation.maxLength)) {
    return `Ən çoxu ${validation.maxLength} simvol olmalıdır`;
  }

  return null;
};

/**
 * Ədəd dəyərini validasiya edir
 */
const validateNumber = (value: string, validation: ColumnValidation): string | null => {
  const numValue = parseFloat(value);

  // Ədəd olub olmadığını yoxlayırıq
  if (isNaN(numValue)) {
    return 'Düzgün ədəd daxil edin';
  }

  // Minimum dəyər yoxlaması
  if (validation.min !== undefined && numValue < validation.min) {
    return `Ədəd ${validation.min}-dən böyük və ya bərabər olmalıdır`;
  }

  // Maksimum dəyər yoxlaması
  if (validation.max !== undefined && numValue > validation.max) {
    return `Ədəd ${validation.max}-dən kiçik və ya bərabər olmalıdır`;
  }

  return null;
};

/**
 * Seçim dəyərini validasiya edir
 */
const validateSelect = (value: string, validation: ColumnValidation): string | null => {
  // Seçim siyahısında olub olmadığını yoxlayırıq
  if (validation.inclusion && Array.isArray(validation.inclusion)) {
    if (!validation.inclusion.includes(value)) {
      return 'Düzgün seçim edin';
    }
  }
  return null;
};

/**
 * Tarix dəyərini validasiya edir
 */
const validateDate = (value: string, validation: ColumnValidation): string | null => {
  const date = new Date(value);
  
  // Düzgün tarix olub olmadığını yoxlayırıq
  if (isNaN(date.getTime())) {
    return 'Düzgün tarix daxil edin';
  }
  
  // Əlavə tarix validasiyaları burada həyata keçirilə bilər
  
  return null;
};

/**
 * Radio seçimini validasiya edir
 */
const validateRadio = (value: string, validation: ColumnValidation): string | null => {
  // Radio üçün seçimdə olub olmadığını yoxlayırıq
  if (validation.inclusion && Array.isArray(validation.inclusion)) {
    if (!validation.inclusion.includes(value)) {
      return 'Düzgün seçim edin';
    }
  }
  return null;
};

/**
 * Bütün giriş dəyərlərini validasiya edir
 */
export const validateAllEntryValues = (
  entries: EntryValue[],
  columns: Column[]
): { isValid: boolean; validatedEntries: EntryValue[] } => {
  const validatedEntries = entries.map(entry => {
    const column = columns.find(col => col.id === entry.columnId || col.id === entry.column_id);
    if (!column) return { ...entry, isValid: true };
    
    const error = validateEntryValue(entry.value, column.type, column.validation);
    return {
      ...entry,
      isValid: !error,
      error: error || undefined
    };
  });
  
  const isValid = validatedEntries.every(entry => entry.isValid);
  
  return { isValid, validatedEntries };
};

/**
 * Data entries üçün statusları idarə edir
 */
export const getEntryStatus = (status?: DataEntryStatus): {
  label: string;
  color: string;
} => {
  switch (status) {
    case 'approved':
      return { label: 'Təsdiqlənib', color: 'bg-green-500' };
    case 'pending':
      return { label: 'Gözləmədə', color: 'bg-yellow-500' };
    case 'rejected':
      return { label: 'Rədd edilib', color: 'bg-red-500' };
    case 'draft':
      return { label: 'Qaralama', color: 'bg-gray-500' };
    default:
      return { label: 'Naməlum', color: 'bg-gray-500' };
  }
};

/**
 * Tip üçün uyğun giriş sahəsi növünü qaytarır
 */
export const getInputTypeForColumnType = (type: ColumnType): string => {
  switch (type) {
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'checkbox':
      return 'checkbox';
    case 'radio':
      return 'radio';
    default:
      return 'text';
  }
};
