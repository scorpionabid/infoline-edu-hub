
import { Column, EntryValue, ColumnValidationError, CategoryWithColumns } from '@/types/dataEntry';

/**
 * Daxil edilmiş dəyərləri çıxarır
 */
export const extractValues = (entries: EntryValue[], categoryId: string, columns: Column[]): EntryValue[] => {
  return columns
    .filter(column => column.category_id === categoryId)
    .map(column => {
      const existingEntry = entries.find(entry => entry.column_id === column.id);
      
      return {
        column_id: column.id,
        category_id: categoryId,
        school_id: existingEntry?.school_id || '',
        value: existingEntry?.value ?? (column.default_value || '')
      };
    });
};

/**
 * Form dəyərlərinin validasiyasını həyata keçirir
 */
export const validateForm = (entries: EntryValue[], columns: Column[]): ColumnValidationError[] => {
  const errors: ColumnValidationError[] = [];

  for (const column of columns) {
    const entry = entries.find(e => e.column_id === column.id);
    
    if (!entry) continue;
    
    const value = entry.value;
    
    // Məcburi sahələrin yoxlanması
    if (column.is_required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: column.id,
        message: `${column.name} sahəsi mütləq doldurulmalıdır`,
        type: 'required'
      });
      continue;
    }
    
    // Tip-ə görə validasiya
    if (value !== undefined && value !== null && value !== '') {
      if (column.type === 'number') {
        const numValue = Number(value);
        
        if (isNaN(numValue)) {
          errors.push({
            field: column.id,
            message: `${column.name} sahəsi ədəd olmalıdır`,
            type: 'type'
          });
          continue;
        }
        
        // Min/max yoxlanması
        if (column.validation) {
          const validation = typeof column.validation === 'string' 
            ? JSON.parse(column.validation) 
            : column.validation;
            
          if (validation.min !== undefined && numValue < validation.min) {
            errors.push({
              field: column.id,
              message: `${column.name} sahəsi minimum ${validation.min} olmalıdır`,
              type: 'min'
            });
          }
          
          if (validation.max !== undefined && numValue > validation.max) {
            errors.push({
              field: column.id,
              message: `${column.name} sahəsi maksimum ${validation.max} olmalıdır`,
              type: 'max'
            });
          }
        }
      }
      
      // Digər validasiyalar burada əlavə edilə bilər
    }
  }
  
  return errors;
};

/**
 * Vəziyyətin dəyişdiyini yoxlayır
 */
export const hasStateChanged = (oldEntries: EntryValue[], newEntries: EntryValue[]): boolean => {
  if (oldEntries.length !== newEntries.length) return true;
  
  for (const newEntry of newEntries) {
    const oldEntry = oldEntries.find(e => e.column_id === newEntry.column_id);
    
    if (!oldEntry) return true;
    if (JSON.stringify(oldEntry.value) !== JSON.stringify(newEntry.value)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Verilmiş tarix sətirini lokal formatda göstərir
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};
