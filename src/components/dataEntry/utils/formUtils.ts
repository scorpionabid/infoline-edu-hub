
import { EntryValue } from '@/types/dataEntry';
import { Column } from '@/types/column';

/**
 * Form məlumatlarını təsdiqləyir
 * @param entries Məlumat girişləri
 * @param columns Sütun məlumatları
 * @returns Təsdiqlənmiş məlumat girişləri
 */
export const validateEntries = (entries: EntryValue[], columns: Column[]): EntryValue[] => {
  return entries.map(entry => {
    const column = columns.find(col => col.id === entry.columnId);
    if (!column) return { ...entry, isValid: true };
    
    let isValid = true;
    let errorMessage = '';
    
    // Məcburi sahə yoxlaması
    if (column.is_required && (!entry.value || String(entry.value).trim() === '')) {
      isValid = false;
      errorMessage = 'Bu sahə məcburidir';
    }
    
    // Tip və validasiya qaydalarını yoxla
    if (isValid && column.validation && entry.value) {
      switch (column.type) {
        case 'number':
          const numValue = parseFloat(String(entry.value));
          if (column.validation.min && numValue < column.validation.min) {
            isValid = false;
            errorMessage = `Dəyər minimum ${column.validation.min} olmalıdır`;
          }
          if (column.validation.max && numValue > column.validation.max) {
            isValid = false;
            errorMessage = `Dəyər maksimum ${column.validation.max} olmalıdır`;
          }
          break;
          
        case 'text':
        case 'textarea':
          const strValue = String(entry.value);
          if (column.validation.minLength && strValue.length < column.validation.minLength) {
            isValid = false;
            errorMessage = `Mətn minimum ${column.validation.minLength} simvol olmalıdır`;
          }
          if (column.validation.maxLength && strValue.length > column.validation.maxLength) {
            isValid = false;
            errorMessage = `Mətn maksimum ${column.validation.maxLength} simvol olmalıdır`;
          }
          if (column.validation.pattern) {
            try {
              const regex = new RegExp(column.validation.pattern);
              if (!regex.test(String(entry.value))) {
                isValid = false;
                errorMessage = 'Mətn düzgün formatda deyil';
              }
            } catch (e) {
              // Regex xətası olduqda ignorə edirik
            }
          }
          break;
          
        case 'email':
          if (column.validation.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(String(entry.value))) {
              isValid = false;
              errorMessage = 'Düzgün e-poçt ünvanı daxil edin';
            }
          }
          break;
          
        case 'url':
          if (column.validation.url) {
            try {
              new URL(String(entry.value));
            } catch (e) {
              isValid = false;
              errorMessage = 'Düzgün URL daxil edin';
            }
          }
          break;
          
        case 'phone':
          if (column.validation.tel && column.validation.pattern) {
            try {
              const regex = new RegExp(column.validation.pattern);
              if (!regex.test(String(entry.value))) {
                isValid = false;
                errorMessage = 'Düzgün telefon nömrəsi daxil edin';
              }
            } catch (e) {
              // Regex xətası olduqda ignorə edirik
            }
          }
          break;
          
        case 'date':
        case 'datetime':
          const dateValue = entry.value instanceof Date ? entry.value : new Date(String(entry.value));
          if (column.validation.minDate && dateValue < new Date(column.validation.minDate)) {
            isValid = false;
            errorMessage = `Tarix ${new Date(column.validation.minDate).toLocaleDateString()} və ya sonra olmalıdır`;
          }
          if (column.validation.maxDate && dateValue > new Date(column.validation.maxDate)) {
            isValid = false;
            errorMessage = `Tarix ${new Date(column.validation.maxDate).toLocaleDateString()} və ya əvvəl olmalıdır`;
          }
          break;
      }
    }
    
    return {
      ...entry,
      isValid,
      error: isValid ? undefined : errorMessage
    };
  });
};
