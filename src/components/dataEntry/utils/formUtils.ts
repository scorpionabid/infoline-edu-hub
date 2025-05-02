
import { Column, ColumnType, ColumnValidation } from '@/types/column';
import { DataEntryStatus } from '@/types/dataEntry';
import { EntryValue } from '@/types/dataEntry';

/**
 * Daxil edilən dəyərin müəyyən sütun növü və validasiyaya uyğun olub-olmadığını yoxlayır
 */
export const validateEntryValue = (
  value: string, 
  type: ColumnType, 
  validation?: ColumnValidation
): string | null => {
  // Əgər validasiya tələbləri yoxdursa, validdir
  if (!validation) return null;

  // Tələb olunması yoxlaması
  if (validation.required && !value.trim()) {
    return validation.requiredMessage || "Bu sahə tələb olunur";
  }

  // Boş dəyər üçün validasiyanı keç (tələb olunmursa)
  if (!value.trim() && !validation.required) return null;

  // Tip-ə əsaslanan validasiya
  switch (type) {
    case 'text':
    case 'textarea':
      return validateTextValue(value, validation);
      
    case 'number':
      return validateNumberValue(value, validation);
      
    case 'select':
    case 'radio':
      return validateChoiceValue(value, validation);
      
    case 'date':
      return validateDateValue(value);
      
    default:
      return null;
  }
};

/**
 * Mətn tipli dəyərləri validasiya edir
 */
const validateTextValue = (value: string, validation: ColumnValidation): string | null => {
  // Minimum uzunluq yoxlaması
  if (validation.minLength && value.length < validation.minLength) {
    return `Minimum ${validation.minLength} simvol tələb olunur`;
  }
  
  // Maksimum uzunluq yoxlaması
  if (validation.maxLength && value.length > validation.maxLength) {
    return `Maksimum ${validation.maxLength} simvol ola bilər`;
  }
  
  // Pattern yoxlaması
  if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
    return validation.patternMessage || "Dəyər tələb olunan formatda deyil";
  }
  
  // Email validasiyası
  if (validation.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    return "Düzgün email formatı daxil edin";
  }
  
  // URL validasiyası
  if (validation.url && !/^(http|https):\/\/[^ "]+$/.test(value)) {
    return "Düzgün URL formatı daxil edin";
  }
  
  // Daxil edilməsi tələb olunan dəyərlər
  if (validation.inclusion && Array.isArray(validation.inclusion)) {
    if (!validation.inclusion.includes(value)) {
      return `Dəyər bunlardan biri olmalıdır: ${validation.inclusion.join(', ')}`;
    }
  }
  
  return null;
};

/**
 * Ədəd tipli dəyərləri validasiya edir
 */
const validateNumberValue = (value: string, validation: ColumnValidation): string | null => {
  // Rəqəm olub-olmadığını yoxlayır
  if (!/^-?\d+(\.\d+)?$/.test(value)) {
    return "Rəqəm daxil etməlisiniz";
  }
  
  const numValue = parseFloat(value);
  
  // Minimum dəyər yoxlaması
  if (validation.min !== undefined && numValue < validation.min) {
    return `Minimum dəyər ${validation.min} olmalıdır`;
  }
  
  // Maximum dəyər yoxlaması
  if (validation.max !== undefined && numValue > validation.max) {
    return `Maksimum dəyər ${validation.max} olmalıdır`;
  }
  
  return null;
};

/**
 * Seçim tipli dəyərləri validasiya edir
 */
const validateChoiceValue = (value: string, validation: ColumnValidation): string | null => {
  // Validasiya seçimlərini yoxlayırıq
  if (validation.inclusion && Array.isArray(validation.inclusion)) {
    if (!validation.inclusion.includes(value)) {
      return "Etibarlı seçim deyil";
    }
  }
  
  return null;
};

/**
 * Tarix tipli dəyərləri validasiya edir
 */
const validateDateValue = (value: string): string | null => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return "Etibarlı tarix deyil";
  }
  return null;
};

/**
 * Kateqoriya tamamlanma statusunu hesablayır
 */
export const calculateCategoryStatus = (
  values: EntryValue[], 
  columns: Column[]
): {
  status: 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'pending' | 'partial';
  completionPercentage: number;
} => {
  const totalColumns = columns.length;
  if (totalColumns === 0) {
    return { status: 'not_started', completionPercentage: 0 };
  }

  const filledValues = values.filter(v => v.value?.trim());
  const completionPercentage = Math.round((filledValues.length / totalColumns) * 100);
  
  // Statusu təyin et
  if (filledValues.length === 0) {
    return { status: 'not_started', completionPercentage };
  } else if (filledValues.length < totalColumns) {
    return { status: 'in_progress', completionPercentage };
  } else if (values.some(v => v.status === 'rejected')) {
    return { status: 'rejected', completionPercentage };
  } else if (values.some(v => v.status === 'pending')) {
    return { status: 'pending', completionPercentage };
  } else if (values.every(v => v.status === 'approved')) {
    return { status: 'approved', completionPercentage };
  } else {
    return { status: 'completed', completionPercentage };
  }
};
