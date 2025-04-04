
import { EntryValue } from '@/types/dataEntry';
import { ColumnType } from '@/types/column';

/**
 * Verilmiş sütun ID-si üçün dəyəri kateqoriya məlumatları içərisindən əldə edir
 */
export const getValueForColumn = (values: EntryValue[], columnId: string): any => {
  const value = values.find(v => v.columnId === columnId)?.value;
  return value !== undefined ? value : '';
};

/**
 * Verilmiş sütun ID-si üçün statusu kateqoriya məlumatları içərisindən əldə edir
 */
export const getStatusForColumn = (values: EntryValue[], columnId: string): 'pending' | 'approved' | 'rejected' => {
  return values.find(v => v.columnId === columnId)?.status || 'pending';
};

/**
 * Sütun tipinə görə dəyərin düzgün formatını təyin edir
 */
export const formatValueByType = (value: any, type: ColumnType): any => {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'number':
      return value === '' ? '' : Number(value);
    case 'checkbox':
      return Boolean(value);
    case 'date':
      return value instanceof Date ? value : value ? new Date(value) : '';
    default:
      return value;
  }
};

/**
 * Verilmiş dəyərin boş olub-olmadığını yoxlayır
 */
export const isEmptyValue = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
};

/**
 * Sütun validasiyasını yoxlayır və xəta mesajı qaytarır
 */
export const validateColumnValue = (value: any, type: ColumnType, isRequired: boolean, validationRules?: any): string | undefined => {
  // Əgər sahə məcburidirsə və boşdursa
  if (isRequired && isEmptyValue(value)) {
    return 'Bu sahə məcburidir';
  }
  
  // Əgər dəyər boş deyilsə və validasiya qaydaları varsa
  if (!isEmptyValue(value) && validationRules) {
    switch (type) {
      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) return 'Rəqəm daxil edin';
        if (validationRules.minValue !== undefined && numValue < validationRules.minValue) {
          return `Minimum dəyər ${validationRules.minValue} olmalıdır`;
        }
        if (validationRules.maxValue !== undefined && numValue > validationRules.maxValue) {
          return `Maksimum dəyər ${validationRules.maxValue} olmalıdır`;
        }
        break;
      case 'text':
        if (validationRules.regex) {
          const regex = new RegExp(validationRules.regex);
          if (!regex.test(String(value))) {
            return validationRules.regexMessage || 'Daxil edilmiş mətn formatı düzgün deyil';
          }
        }
        break;
      // Digər tip validasiyaları burada əlavə edilə bilər
    }
  }
  
  return undefined;
};
