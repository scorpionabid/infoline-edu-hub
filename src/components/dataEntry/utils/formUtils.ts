import { ColumnType } from '@/types/column';
import { ColumnValidation, ColumnValidationError } from '@/types/column';
import { EntryValue } from '@/types/dataEntry';

/**
 * Giriş məlumatını sütun tipinə və validasiya qaydalarına görə doğrulayır
 * @param value Dəyər
 * @param type Sütun tipi
 * @param validation Validasiya qaydaları 
 */
export const validateEntryValue = (
  value: string,
  columnType: ColumnType,
  validation?: ColumnValidation
): string | null => {
  // Validasiya qaydaları olmayan hal
  if (!validation) return null;

  // Boş qiymət kontrolu
  if (validation && validation?.required && !value?.trim()) {
    return validation?.requiredMessage || 'Bu sahə məcburidir';
  }

  // Boş qiymət halında digər validasiya qaydalarını yoxlamırıq
  if (!value || !value.trim()) {
    return null;
  }

  // Sütun tipinə əsasən validasiya
  switch (columnType) {
    case 'text':
    case 'textarea':
      // Min uzunluq yoxlaması
      if (validation.minLength && value.length < validation.minLength) {
        return `Minimum ${validation.minLength} simvol olmalıdır`;
      }
      // Max uzunluq yoxlaması
      if (validation.maxLength && value.length > validation.maxLength) {
        return `Maksimum ${validation.maxLength} simvol olmalıdır`;
      }
      // Pattern yoxlaması
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return validation.patternMessage || 'Düzgün format deyil';
      }
      break;

    case 'email':
    case 'text':
      // Email formatı yoxlaması (email tipli sahə üçün)
      if (validation.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Düzgün email formatında deyil';
      }
      break;

    case 'url':
    case 'text':
      // URL formatı yoxlaması (URL tipli sahə üçün)
      if (validation.url && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/.test(value)) {
        return 'Düzgün URL formatında deyil';
      }
      break;

    case 'select':
      // Seçim sahəsinin validasiyası
      if (validation.inclusion && 
          Array.isArray(validation.inclusion) && 
          validation.inclusion.length > 0 && 
          !validation.inclusion.includes(value)) {
        return `Seçim ${validation.inclusion.join(', ')} siyahısından olmalıdır`;
      }
      break;

    case 'number':
      // Rəqəmsal tip üçün kontrol
      if (isNaN(Number(value))) {
        return 'Bu sahə rəqəm olmalıdır';
      }
      
      const numValue = parseFloat(value);
      
      // Minimum dəyər kontrolu
      if (validation.min !== undefined && numValue < validation.min) {
        return `Ən az ${validation.min} olmalıdır`;
      }
      
      // Maksimum dəyər kontrolu
      if (validation.max !== undefined && numValue > validation.max) {
        return `Ən çox ${validation.max} olmalıdır`;
      }
      break;
      
    case 'date':
      // Tarix formatı yoxlaması
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) && !/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
        return 'Düzgün tarix formatında deyil';
      }
      break;
      
    case 'checkbox':
      // Checkbox-ın işarələnmiş olmasının kontrolu
      if (validation.required && value !== 'true' && value !== 'on') {
        return 'Bu seçim məcburidir';
      }
      break;
      
    // Digər sahə tipləri üçün validasiya
  }

  return null;
};

/**
 * Bütün formun validasiyası
 * @param entries Formdaki giriş dəyərləri
 * @param columns Sütunlar
 */
export const validateForm = (entries: EntryValue[], columns: Record<string, any>): boolean => {
  let isValid = true;
  
  entries.forEach(entry => {
    const column = columns[entry.columnId || entry.column_id || ''];
    
    if (column) {
      const error = validateEntryValue(entry.value, column.type, column.validation);
      if (error) {
        isValid = false;
      }
    }
  });
  
  return isValid;
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
