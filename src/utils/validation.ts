
import { Column, ColumnType } from '@/types/column';
import { ColumnValidationError } from '@/types/dataEntry';

/**
 * Tip əsasında məlumatı təsdiqləyir və çevirir
 * @param column Sütun
 * @param value Dəyər
 */
export function formatValueByType(column: Column, value: any): any {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  switch (column.type) {
    case 'number':
      return parseFloat(value);
    case 'checkbox':
      return value === true || value === 'true' || value === 1;
    case 'date':
      // Tarixin düzgün formatda olduğunu əmin olmaq
      try {
        return new Date(value).toISOString().split('T')[0];
      } catch {
        return '';
      }
    default:
      return value;
  }
}

/**
 * Dəyərin boş olub-olmadığını yoxlayır
 * @param value Yoxlanacaq dəyər
 */
export function isEmptyValue(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Sütun dəyərini validasiya edir
 * @param column Sütun
 * @param value Dəyər
 * @returns Xəta mesajı və ya boş string
 */
export function validateColumnValue(column: Column, value: any): ColumnValidationError | null {
  // Əgər sütun məcburidirsə və dəyər boşdursa
  if (column.is_required && isEmptyValue(value)) {
    return {
      columnId: column.id,
      message: 'Bu sahə tələb olunur',
      severity: 'error'
    };
  }

  // Əgər dəyər boşdursa və məcburi deyilsə, validasiya etmə
  if (isEmptyValue(value)) {
    return null;
  }

  // Validation qaydalarına uyğun olaraq yoxlama
  const validation = column.validation || {};

  switch (column.type) {
    case 'number':
      const numValue = parseFloat(value);
      
      if (isNaN(numValue)) {
        return {
          columnId: column.id,
          message: 'Düzgün bir rəqəm daxil edin',
          severity: 'error'
        };
      }
      
      if (validation.minValue !== undefined && numValue < validation.minValue) {
        return {
          columnId: column.id,
          message: `Minimum dəyər ${validation.minValue} olmalıdır`,
          severity: 'error'
        };
      }
      
      if (validation.maxValue !== undefined && numValue > validation.maxValue) {
        return {
          columnId: column.id,
          message: `Maksimum dəyər ${validation.maxValue} olmalıdır`,
          severity: 'error'
        };
      }
      break;
      
    case 'text':
    case 'textarea':
      const strValue = String(value);
      
      if (validation.minLength !== undefined && strValue.length < validation.minLength) {
        return {
          columnId: column.id,
          message: `Minimum ${validation.minLength} simvol olmalıdır`,
          severity: 'error'
        };
      }
      
      if (validation.maxLength !== undefined && strValue.length > validation.maxLength) {
        return {
          columnId: column.id,
          message: `Maksimum ${validation.maxLength} simvol olmalıdır`,
          severity: 'error'
        };
      }
      
      if (validation.pattern && validation.regex) {
        try {
          const regex = new RegExp(validation.regex);
          if (!regex.test(strValue)) {
            return {
              columnId: column.id,
              message: validation.patternError || 'Format düzgün deyil',
              severity: 'error'
            };
          }
        } catch (e) {
          console.error('Regex xətası:', e);
        }
      }
      break;
      
    case 'date':
      try {
        const dateValue = new Date(value);
        
        if (isNaN(dateValue.getTime())) {
          return {
            columnId: column.id,
            message: 'Düzgün tarix formatı deyil',
            severity: 'error'
          };
        }
        
        if (validation.minDate) {
          const minDate = new Date(validation.minDate);
          if (dateValue < minDate) {
            return {
              columnId: column.id,
              message: `Tarix ${validation.minDate}-dən sonra olmalıdır`,
              severity: 'error'
            };
          }
        }
        
        if (validation.maxDate) {
          const maxDate = new Date(validation.maxDate);
          if (dateValue > maxDate) {
            return {
              columnId: column.id,
              message: `Tarix ${validation.maxDate}-dən əvvəl olmalıdır`,
              severity: 'error'
            };
          }
        }
      } catch (e) {
        return {
          columnId: column.id,
          message: 'Düzgün tarix formatı deyil',
          severity: 'error'
        };
      }
      break;
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return {
          columnId: column.id,
          message: 'Düzgün email formatı deyil',
          severity: 'error'
        };
      }
      break;
      
    case 'phone':
      // Telefon nömrəsi validasiyası
      const phoneRegex = /^[+]?[\d\s()-]{7,15}$/;
      if (!phoneRegex.test(String(value))) {
        return {
          columnId: column.id,
          message: 'Düzgün telefon nömrəsi formatı deyil',
          severity: 'error'
        };
      }
      break;
  }

  return null;
}
