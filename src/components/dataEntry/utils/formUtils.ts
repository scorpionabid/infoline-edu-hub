
import { Column, ColumnType, ColumnValidation } from '@/types/column';
import { EntryValue } from '@/types/dataEntry';

// Form data validasiyası üçün funksiya
export const validateEntryValue = (
  value: any, 
  columnType: ColumnType,
  validation?: ColumnValidation
): string | null => {
  if (!validation) return null;
  
  // Məcburi sahə yoxlaması
  if (validation.required && (value === undefined || value === null || value === '')) {
    return validation.requiredMessage || 'Bu sahə doldurulmalıdır';
  }
  
  // Əgər dəyər boşdursa və məcburi deyilsə, başqa validasiyalara baxmırıq
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  switch (columnType) {
    case 'text':
    case 'textarea': {
      const strValue = String(value);
      
      // Minimum uzunluq yoxlaması
      if (validation.minLength && strValue.length < validation.minLength) {
        return `Minimum ${validation.minLength} simvol olmalıdır`;
      }
      
      // Maksimum uzunluq yoxlaması
      if (validation.maxLength && strValue.length > validation.maxLength) {
        return `Maksimum ${validation.maxLength} simvol ola bilər`;
      }
      
      // Regex pattern yoxlaması
      if (validation.pattern && !new RegExp(validation.pattern).test(strValue)) {
        return validation.patternMessage || 'Düzgün format deyil';
      }
      
      // E-mail formatı yoxlaması
      if (validation.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
        return 'Düzgün e-mail formatı deyil';
      }
      
      // URL formatı yoxlaması
      if (validation.url && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(strValue)) {
        return 'Düzgün URL formatı deyil';
      }
      
      // Siyahıya daxil olma yoxlaması (inclusion)
      if (validation.inclusion && Array.isArray(validation.inclusion) && !validation.inclusion.includes(strValue)) {
        return `Dəyər bu siyahıda olmalıdır: ${validation.inclusion.join(', ')}`;
      }
      
      break;
    }
    
    case 'number': {
      const numValue = Number(value);
      
      // Ədəd olub-olmadığını yoxlayaq
      if (isNaN(numValue)) {
        return 'Düzgün ədəd formatı deyil';
      }
      
      // Minimum dəyər yoxlaması
      if (validation.min !== undefined && numValue < validation.min) {
        return `Minimum dəyər ${validation.min} olmalıdır`;
      }
      
      // Maksimum dəyər yoxlaması
      if (validation.max !== undefined && numValue > validation.max) {
        return `Maksimum dəyər ${validation.max} ola bilər`;
      }
      
      break;
    }
    
    case 'select':
    case 'checkbox':
    case 'radio': {
      // Bu tiplərdə validasiya ediləcək xüsusi məntiqlər
      break;
    }
    
    default:
      break;
  }
  
  return null;
};

// Sütun və data dəyərlərindən form üçün ilkin dəyərləri hazırlayır
export const prepareFormValues = (columns: Column[], data: any[]): EntryValue[] => {
  return columns.map(column => {
    const entry = data.find(item => item.column_id === column.id);
    
    return {
      column_id: column.id,
      value: entry?.value || column.default_value || '',
      name: column.name,
      isValid: true
    };
  });
};

// Dəyişikliklər edilib-edilmədiyini yoxlayır
export const hasChanges = (initialValues: EntryValue[], currentValues: EntryValue[]): boolean => {
  if (initialValues.length !== currentValues.length) {
    return true;
  }
  
  for (let i = 0; i < initialValues.length; i++) {
    const initialValue = initialValues[i];
    const currentValue = currentValues.find(v => v.column_id === initialValue.column_id);
    
    if (!currentValue || currentValue.value !== initialValue.value) {
      return true;
    }
  }
  
  return false;
};
