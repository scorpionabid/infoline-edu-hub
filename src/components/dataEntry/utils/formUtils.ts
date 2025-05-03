
import { Column } from '@/types/column';
import { DataEntry, DataEntryStatus, EntryValue } from '@/types/dataEntry';

// Form dəyərinin validasiyası
export const validateEntryValue = (value: string, columnType: string, validation?: any): string | null => {
  if (!validation) return null;
  
  // Required check
  if (validation.required !== undefined && validation.required && (!value || value.trim() === '')) {
    return 'Bu sahə tələb olunur';
  }
  
  // Text validations
  if (columnType === 'text' || columnType === 'textarea') {
    // Min length
    if (validation.minLength && value.length < validation.minLength) {
      return `Minimum ${validation.minLength} simvol olmalıdır`;
    }
    
    // Max length
    if (validation.maxLength && value.length > validation.maxLength) {
      return `Maksimum ${validation.maxLength} simvol olmalıdır`;
    }
    
    // Pattern
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return validation.customError || 'Düzgün formatda deyil';
      }
    }
  }
  
  // Number validations
  if (columnType === 'number') {
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return 'Düzgün rəqəm daxil edin';
    }
    
    // Min value
    if (validation.minValue !== undefined && numValue < validation.minValue) {
      return `Minimum dəyər ${validation.minValue} olmalıdır`;
    }
    
    // Max value
    if (validation.maxValue !== undefined && numValue > validation.maxValue) {
      return `Maksimum dəyər ${validation.maxValue} olmalıdır`;
    }
  }
  
  return null;
};

// Bütün sahələri validasiya et
export const validateEntries = (entries: EntryValue[], columns: Column[]): EntryValue[] => {
  return entries.map(entry => {
    const column = columns.find(col => col.id === entry.columnId);
    if (!column) return entry;
    
    let error: string | null = null;
    
    // Əgər sahə məcburidirsə və boşdursa
    if (column.is_required && (!entry.value || entry.value.trim() === '')) {
      error = 'Bu sahə tələb olunur';
    }
    // Əgər validasiya varsa
    else if (column.validation) {
      let validationRules: any;
      
      try {
        validationRules = typeof column.validation === 'string' 
          ? JSON.parse(column.validation) 
          : column.validation;
          
        error = validateEntryValue(entry.value, column.type, validationRules);
      } catch(e) {
        console.error('Validasiya parsing xətası:', e);
      }
    }
    
    return {
      ...entry,
      isValid: !error,
      error: error || undefined
    };
  });
};

// EntryValue obyektlərini DataEntry obyektlərinə çevirmək
export const convertEntryValuesToDataEntries = (
  values: EntryValue[],
  categoryId: string,
  schoolId: string,
  status: DataEntryStatus = 'draft'
): Partial<DataEntry>[] => {
  return values.map(entry => ({
    column_id: entry.columnId,
    category_id: categoryId,
    school_id: schoolId,
    value: entry.value || '',
    status,
  }));
};
