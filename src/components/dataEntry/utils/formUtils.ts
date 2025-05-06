
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
    if (column.is_required && (!entry.value || entry.value.trim() === '')) {
      isValid = false;
      errorMessage = 'Bu sahə məcburidir';
    }
    
    // Tip və validasiya qaydalarını yoxla
    if (isValid && column.validation && entry.value) {
      switch (column.type) {
        case 'number':
          if (column.validation.min && parseFloat(entry.value) < column.validation.min) {
            isValid = false;
            errorMessage = `Dəyər minimum ${column.validation.min} olmalıdır`;
          }
          if (column.validation.max && parseFloat(entry.value) > column.validation.max) {
            isValid = false;
            errorMessage = `Dəyər maksimum ${column.validation.max} olmalıdır`;
          }
          break;
          
        case 'text':
        case 'textarea':
          if (column.validation.minLength && entry.value.length < column.validation.minLength) {
            isValid = false;
            errorMessage = `Mətn minimum ${column.validation.minLength} simvol olmalıdır`;
          }
          if (column.validation.maxLength && entry.value.length > column.validation.maxLength) {
            isValid = false;
            errorMessage = `Mətn maksimum ${column.validation.maxLength} simvol olmalıdır`;
          }
          if (column.validation.pattern) {
            try {
              const regex = new RegExp(column.validation.pattern);
              if (!regex.test(entry.value)) {
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
            if (!emailRegex.test(entry.value)) {
              isValid = false;
              errorMessage = 'Düzgün e-poçt ünvanı daxil edin';
            }
          }
          break;
          
        case 'url':
          if (column.validation.url) {
            try {
              new URL(entry.value);
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
              if (!regex.test(entry.value)) {
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
          if (column.validation.minDate && new Date(entry.value) < new Date(column.validation.minDate)) {
            isValid = false;
            errorMessage = `Tarix ${new Date(column.validation.minDate).toLocaleDateString()} və ya sonra olmalıdır`;
          }
          if (column.validation.maxDate && new Date(entry.value) > new Date(column.validation.maxDate)) {
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
